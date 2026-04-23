#!/usr/bin/env python
import json
import os
import re
import sys
import traceback
from typing import Any, Dict, List, Optional

from qiskit import QuantumCircuit, qasm3, transpile
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_aer import AerSimulator
from qiskit_ibm_runtime import QiskitRuntimeService
from qiskit_ibm_runtime import SamplerV2 as Sampler
from qiskit_ibm_runtime.exceptions import RuntimeJobFailureError


MAX_HARDWARE_SHOTS = 1000
MAX_SIMULATOR_SHOTS = 4096
MAX_RECOMMENDED_DEPTH = 1200


def emit(payload: Dict[str, Any], code: int = 0) -> None:
    sys.stdout.write(json.dumps(payload, default=json_safe))
    sys.stdout.flush()
    raise SystemExit(code)


def json_safe(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, dict):
        return {str(k): json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [json_safe(v) for v in value]
    if hasattr(value, "tolist"):
        return value.tolist()
    if hasattr(value, "__dict__"):
        return json_safe(vars(value))
    return str(value)


def read_input() -> Dict[str, Any]:
    raw = sys.stdin.read()
    if not raw.strip():
        return {}
    return json.loads(raw)


def normalize_qasm(qasm: str) -> str:
    qasm = (qasm or "").strip()
    if not qasm:
        return qasm

    if not qasm.upper().startswith("OPENQASM"):
        qasm = "OPENQASM 3.0;\n" + qasm

    if "stdgates.inc" not in qasm and "OPENQASM 3.0;" in qasm:
        qasm = qasm.replace(
            "OPENQASM 3.0;",
            'OPENQASM 3.0;\ninclude "stdgates.inc";',
            1,
        )

    return qasm


def ensure_measurements(circuit: QuantumCircuit) -> QuantumCircuit:
    if circuit.num_clbits > 0 and any(instruction.operation.name == "measure" for instruction in circuit.data):
        return circuit

    measured = circuit.copy()
    measured.measure_all()
    return measured


def load_circuit(qasm: str) -> QuantumCircuit:
    qasm = normalize_qasm(qasm)
    if qasm.upper().startswith("OPENQASM 3"):
        try:
            return qasm3.loads(qasm)
        except Exception:
            translated = translate_openqasm3_to_qasm2(qasm)
            return QuantumCircuit.from_qasm_str(translated)
    return QuantumCircuit.from_qasm_str(qasm)


def translate_openqasm3_to_qasm2(qasm: str) -> str:
    translated = qasm
    translated = translated.replace("OPENQASM 3.0;", "OPENQASM 2.0;")
    translated = translated.replace('include "stdgates.inc";', 'include "qelib1.inc";')
    translated = translated.replace("measure_all;", "")

    translated = re.sub(r"\bqubit\s*\[\s*(\d+)\s*\]\s+([A-Za-z_]\w*)\s*;", r"qreg \2[\1];", translated)
    translated = re.sub(r"\bbit\s*\[\s*(\d+)\s*\]\s+([A-Za-z_]\w*)\s*;", r"creg \2[\1];", translated)

    lines: List[str] = []
    for raw_line in translated.splitlines():
        line = raw_line.strip()
        if not line:
            lines.append(raw_line)
            continue

        if line.startswith("//"):
            lines.append(raw_line)
            continue

        if " = measure " in line:
            lhs, rhs = line.split(" = measure ", 1)
            line = f"measure {rhs.replace(';', '')} -> {lhs};"

        if line.startswith("cp("):
            line = line.replace("cp(", "cu1(", 1)

        lines.append(line)

    return "\n".join(lines)


def get_service() -> QiskitRuntimeService:
    token = os.getenv("IBM_API_KEY")
    instance = os.getenv("IBM_INSTANCE_CRN")

    if not token:
        raise ValueError("IBM_API_KEY is not configured.")

    kwargs: Dict[str, Any] = {
        "channel": os.getenv("IBM_RUNTIME_CHANNEL", "ibm_quantum_platform"),
        "token": token,
    }

    if instance:
        kwargs["instance"] = instance

    return QiskitRuntimeService(**kwargs)


def backend_summary(backend: Any) -> Dict[str, Any]:
    status = None
    pending_jobs = None

    try:
        status = backend.status()
        pending_jobs = getattr(status, "pending_jobs", None)
    except Exception:
        status = None

    try:
        target = getattr(backend, "target", None)
        operation_names = sorted(list(target.operation_names)) if target else []
    except Exception:
        operation_names = []

    coupling_map = None
    try:
        coupling_map_obj = getattr(getattr(backend, "coupling_map", None), "get_edges", None)
        if callable(coupling_map_obj):
            coupling_map = backend.coupling_map.get_edges()
    except Exception:
        coupling_map = None

    return {
        "name": backend.name,
        "qubits": getattr(backend, "num_qubits", None),
        "num_qubits": getattr(backend, "num_qubits", None),
        "status": "operational" if getattr(status, "operational", False) else "offline",
        "operational": getattr(status, "operational", False),
        "queue_length": pending_jobs,
        "simulator": getattr(getattr(backend, "configuration", lambda: None)(), "simulator", False)
        if callable(getattr(backend, "configuration", None))
        else getattr(backend, "simulator", False),
        "is_simulator": getattr(getattr(backend, "configuration", lambda: None)(), "simulator", False)
        if callable(getattr(backend, "configuration", None))
        else getattr(backend, "simulator", False),
        "basis_gates": operation_names,
        "max_shots": getattr(backend, "max_shots", None),
        "coupling_map": coupling_map,
        "version": getattr(backend, "backend_version", None),
    }


def choose_backend(
    service: QiskitRuntimeService,
    qubits_required: int,
    requested_backend: Optional[str] = None,
    exclude_backends: Optional[List[str]] = None,
) -> Any:
    exclude = set(exclude_backends or [])
    if requested_backend and requested_backend not in exclude:
        backend = service.backend(requested_backend)
        if getattr(backend, "num_qubits", 0) < qubits_required:
            raise ValueError(
                f"Requested backend {requested_backend} has {getattr(backend, 'num_qubits', 0)} qubits, "
                f"but the circuit requires {qubits_required}."
            )
        status = backend.status()
        if not getattr(status, "operational", False):
            raise ValueError(f"Requested backend {requested_backend} is not operational.")
        return backend

    candidates = service.backends(
        simulator=False,
        operational=True,
        min_num_qubits=qubits_required,
    )
    candidates = [backend for backend in candidates if backend.name not in exclude]

    if not candidates:
        raise ValueError("No operational hardware backend satisfies the qubit requirement.")

    candidates.sort(
        key=lambda backend: (
            getattr(getattr(backend, "status", lambda: None)(), "pending_jobs", 10**9),
            backend.name,
        )
    )
    return candidates[0]


def transpile_for_backend(circuit: QuantumCircuit, backend: Any) -> QuantumCircuit:
    pm = generate_preset_pass_manager(backend=backend, optimization_level=1)
    return pm.run(circuit)


def serialize_counts_from_pub(pub_result: Any) -> Dict[str, int]:
    data = getattr(pub_result, "data", None)
    if data is None:
        return {}

    for register_name in dir(data):
        if register_name.startswith("_"):
            continue
        register = getattr(data, register_name)
        if hasattr(register, "get_counts"):
            try:
                counts = register.get_counts()
                if counts:
                    return {str(k): int(v) for k, v in counts.items()}
            except Exception:
                pass

    raw = json_safe(data)
    if isinstance(raw, dict):
        for value in raw.values():
            if isinstance(value, dict) and all(isinstance(k, str) for k in value.keys()):
                return {str(k): int(v) for k, v in value.items() if isinstance(v, (int, float))}

    return {}


def extract_pub_metadata(pub_result: Any) -> Dict[str, Any]:
    return json_safe(getattr(pub_result, "metadata", None)) or {}


def analyze_counts(counts: Dict[str, int]) -> Dict[str, Any]:
    total_shots = sum(int(v) for v in counts.values()) if counts else 0
    if not total_shots:
        return {
            "classification": "unknown",
            "summary": "No measurement counts were available to interpret.",
            "dominantState": None,
            "dominantProbability": 0,
            "balanced": False,
            "entropyHint": "unknown",
        }

    sorted_counts = sorted(counts.items(), key=lambda item: item[1], reverse=True)
    dominant_state, dominant_count = sorted_counts[0]
    dominant_probability = dominant_count / total_shots

    probabilities = [value / total_shots for _, value in sorted_counts]
    max_probability = max(probabilities)
    min_probability = min(probabilities)
    spread = max_probability - min_probability

    classification = "noisy_or_random"
    summary = "The output distribution is spread across multiple states, suggesting randomness or hardware noise."
    entropy_hint = "high"

    if len(sorted_counts) == 2 and set(counts.keys()) in ({"00", "11"}, {"0", "1"}):
        if all(0.35 <= probability <= 0.65 for probability in probabilities):
            classification = "entangled_like"
            summary = "The result is concentrated on correlated states, which is consistent with entanglement-style behavior."
            entropy_hint = "medium"
    elif dominant_probability >= 0.9:
        classification = "deterministic"
        summary = f"The circuit produced a strongly dominant output state ({dominant_state}), so the behavior looks deterministic."
        entropy_hint = "low"
    elif spread <= 0.15:
        classification = "noisy_or_random"
        summary = "The outcomes are fairly balanced, which suggests a random-looking or noise-affected result."
        entropy_hint = "high"

    return {
        "classification": classification,
        "summary": summary,
        "dominantState": dominant_state,
        "dominantProbability": round(dominant_probability, 4),
        "balanced": spread <= 0.15,
        "entropyHint": entropy_hint,
    }


def validate(payload: Dict[str, Any]) -> Dict[str, Any]:
    qasm = normalize_qasm(payload.get("qasm", ""))
    circuit_type = (payload.get("circuitType") or "sampler").lower()
    warnings: List[str] = []

    if not qasm:
        raise ValueError("QASM input is empty.")

    circuit = load_circuit(qasm)
    if circuit_type == "sampler":
        measured = ensure_measurements(circuit)
        if measured is not circuit:
            warnings.append("No measurements were found, so measurements were added automatically.")
            circuit = measured

    if circuit.num_qubits <= 0:
        raise ValueError("The circuit contains zero qubits.")

    if circuit.depth() > MAX_RECOMMENDED_DEPTH:
        warnings.append(
            f"Circuit depth {circuit.depth()} is high for free-tier hardware and may increase failure probability."
        )

    backend_name = payload.get("backend")
    backend_info = None
    supported_ops: List[str] = []
    transpiled_depth = None

    if backend_name:
        service = get_service()
        backend = service.backend(backend_name)
        backend_info = backend_summary(backend)

        if getattr(backend, "num_qubits", 0) < circuit.num_qubits:
            raise ValueError(
                f"Backend {backend.name} supports {getattr(backend, 'num_qubits', 0)} qubits, "
                f"but the circuit requires {circuit.num_qubits}."
            )

        target = getattr(backend, "target", None)
        supported_ops = sorted(list(target.operation_names)) if target else []

        circuit_ops = sorted(circuit.count_ops().keys())
        unsupported = [
            op for op in circuit_ops
            if op not in supported_ops and op not in {"barrier", "measure"}
        ]
        if unsupported:
            warnings.append(
                "Circuit uses operations that will need transpilation or decomposition on the backend: "
                + ", ".join(unsupported)
            )

        transpiled = transpile_for_backend(circuit, backend)
        transpiled_depth = transpiled.depth()

    return {
        "ok": True,
        "normalizedQasm": qasm,
        "qubits": circuit.num_qubits,
        "clbits": circuit.num_clbits,
        "depth": circuit.depth(),
        "gateCount": len(circuit.data),
        "gateCounts": {str(k): int(v) for k, v in circuit.count_ops().items()},
        "hasMeasurements": any(instr.operation.name == "measure" for instr in circuit.data),
        "warnings": warnings,
        "backend": backend_info,
        "supportedOps": supported_ops,
        "transpiledDepth": transpiled_depth,
    }


def run_simulator(circuit: QuantumCircuit, shots: int, backend_name: str = "aer_simulator") -> Dict[str, Any]:
    simulator = AerSimulator()
    transpiled = transpile(circuit, simulator, optimization_level=1)
    result = simulator.run(transpiled, shots=min(shots, MAX_SIMULATOR_SHOTS)).result()
    counts = result.get_counts()

    return {
        "status": "completed",
        "mode": "simulator",
        "backend": backend_name,
        "transpiledDepth": transpiled.depth(),
        "qubits": transpiled.num_qubits,
        "counts": {str(k): int(v) for k, v in counts.items()},
        "result": {
            "type": "sampler",
            "source": "local_simulator",
            "counts": {str(k): int(v) for k, v in counts.items()},
            "metadata": {},
            "interpretation": analyze_counts({str(k): int(v) for k, v in counts.items()}),
        },
        "logs": "",
        "suggestion": "Hardware execution was unavailable, so the circuit was executed on the simulator.",
    }


def execute_job(payload: Dict[str, Any]) -> Dict[str, Any]:
    validation = validate(payload)
    qasm = validation["normalizedQasm"]
    circuit = load_circuit(qasm)
    circuit = ensure_measurements(circuit)

    requested_shots = int(payload.get("shots") or 1024)
    shots = max(1, min(requested_shots, MAX_HARDWARE_SHOTS))
    warnings = list(validation.get("warnings", []))

    if shots != requested_shots:
        warnings.append(f"Shots were capped to {MAX_HARDWARE_SHOTS} for hardware reliability.")

    allow_fallback = bool(payload.get("allowFallback", True))
    requested_backend = payload.get("backend")
    exclude_backends = payload.get("excludeBackends") or []

    try:
        service = get_service()
        backend = choose_backend(
            service=service,
            qubits_required=circuit.num_qubits,
            requested_backend=requested_backend,
            exclude_backends=exclude_backends,
        )
        transpiled = transpile_for_backend(circuit, backend)
        sampler = Sampler(mode=backend)
        job = sampler.run([transpiled], shots=shots)

        return {
            "status": "queued",
            "mode": "hardware",
            "jobId": job.job_id(),
            "backend": backend.name,
            "backendSummary": backend_summary(backend),
            "qubits": transpiled.num_qubits,
            "depth": circuit.depth(),
            "transpiledDepth": transpiled.depth(),
            "shots": shots,
            "warnings": warnings,
        }
    except Exception as exc:
        if not allow_fallback:
            raise

        simulator_result = run_simulator(circuit, requested_shots)
        simulator_result["warnings"] = warnings + [
            f"Hardware submission failed and the simulator fallback was used: {exc}"
        ]
        simulator_result["failureReason"] = str(exc)
        return simulator_result


def suggestion_for_error(message: str) -> str:
    lowered = (message or "").lower()
    if "measure" in lowered:
        return "Ensure the circuit contains measurements before using Sampler."
    if "qubit" in lowered:
        return "Choose a backend with enough qubits or reduce the circuit width."
    if "payload" in lowered or "invalid" in lowered:
        return "Check the generated QASM and confirm it matches supported OpenQASM syntax."
    if "timeout" in lowered or "queue" in lowered:
        return "Retry on a less busy backend or use the simulator for debugging."
    return "Inspect the runtime logs and consider retrying on a different backend."


def refresh_job(payload: Dict[str, Any]) -> Dict[str, Any]:
    job_id = payload.get("jobId")
    if not job_id:
        raise ValueError("jobId is required.")

    service = get_service()
    job = service.job(job_id)
    status = str(job.status())

    response: Dict[str, Any] = {
        "jobId": job_id,
        "status": status,
        "backend": getattr(job.backend(), "name", None) if job.backend() else None,
        "logs": "",
        "errorMessage": None,
        "metrics": None,
        "usage": None,
    }

    try:
        response["metrics"] = json_safe(job.metrics())
    except Exception:
        response["metrics"] = None

    try:
        response["usage"] = json_safe(job.usage())
    except Exception:
        response["usage"] = None

    if status in {"DONE", "ERROR", "CANCELLED"}:
        try:
            response["logs"] = job.logs()
        except Exception:
            response["logs"] = ""

    if status == "DONE":
        result = job.result()
        pub_result = result[0]
        counts = serialize_counts_from_pub(pub_result)
        response["result"] = {
            "type": "sampler",
            "source": "ibm_runtime",
            "counts": counts,
            "metadata": extract_pub_metadata(pub_result),
            "interpretation": analyze_counts(counts),
        }
        response["counts"] = counts
        response["transpiledDepth"] = None
        return response

    if status == "ERROR":
        error_message = None
        try:
            error_message = job.error_message()
        except Exception:
            error_message = None

        response["errorMessage"] = error_message
        response["reason"] = error_message or "IBM Runtime reported an ERROR state."
        response["suggestion"] = suggestion_for_error(response["reason"])

        try:
            job.result()
        except RuntimeJobFailureError:
            pass

        return response

    return response


def list_backends(payload: Dict[str, Any]) -> Dict[str, Any]:
    qubits = int(payload.get("minQubits") or 1)
    service = get_service()
    backends = service.backends(simulator=False, operational=True, min_num_qubits=qubits)
    ordered = sorted(
        backends,
        key=lambda backend: (
            getattr(getattr(backend, "status", lambda: None)(), "pending_jobs", 10**9),
            backend.name,
        ),
    )
    return {
        "devices": [backend_summary(backend) for backend in ordered]
    }


def main() -> None:
    if len(sys.argv) < 2:
        emit({"ok": False, "error": "Action argument is required."}, code=1)

    action = sys.argv[1]
    payload = read_input()

    try:
        if action == "validate":
            emit({"ok": True, "data": validate(payload)})
        if action == "execute_job":
            emit({"ok": True, "data": execute_job(payload)})
        if action == "refresh_job":
            emit({"ok": True, "data": refresh_job(payload)})
        if action == "list_backends":
            emit({"ok": True, "data": list_backends(payload)})
        emit({"ok": False, "error": f"Unsupported action: {action}"}, code=1)
    except Exception as exc:
        emit(
            {
                "ok": False,
                "error": str(exc),
                "traceback": traceback.format_exc(),
            },
            code=1,
        )


if __name__ == "__main__":
    main()

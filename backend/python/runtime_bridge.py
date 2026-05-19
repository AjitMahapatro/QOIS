#!/usr/bin/env python
import json
import os
import re
import sys
import time
import traceback
from typing import Any, Dict, List, Optional

from qiskit import QuantumCircuit, qasm3, transpile
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_ibm_runtime import QiskitRuntimeService
from qiskit_ibm_runtime import SamplerV2 as Sampler
from qiskit_ibm_runtime.exceptions import RuntimeJobFailureError

# =========================================================
# MEMORY-OPTIMIZED QUANTUM RUNTIME BRIDGE
# =========================================================

MAX_HARDWARE_SHOTS = 1000
MAX_SIMULATOR_SHOTS = 4096
MAX_RECOMMENDED_DEPTH = 1200

# Backend cache
BACKEND_CACHE = None
BACKEND_CACHE_TIME = 0
BACKEND_CACHE_TTL = 300  # 5 mins


# =========================================================
# HELPERS
# =========================================================

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

    return str(value)


def read_input() -> Dict[str, Any]:
    raw = sys.stdin.read()

    if not raw.strip():
        return {}

    return json.loads(raw)


# =========================================================
# QASM HANDLING
# =========================================================

def normalize_qasm(qasm: str) -> str:
    qasm = (qasm or "").strip()

    if not qasm:
        return qasm

    if not qasm.upper().startswith("OPENQASM"):
        qasm = "OPENQASM 3.0;\n" + qasm

    if "stdgates.inc" not in qasm:
        qasm = qasm.replace(
            "OPENQASM 3.0;",
            'OPENQASM 3.0;\ninclude "stdgates.inc";',
            1,
        )

    return qasm


def ensure_measurements(circuit: QuantumCircuit) -> QuantumCircuit:
    has_measure = any(
        instruction.operation.name == "measure"
        for instruction in circuit.data
    )

    if has_measure:
        return circuit

    measured = circuit.copy()
    measured.measure_all()

    return measured


def translate_openqasm3_to_qasm2(qasm: str) -> str:
    translated = qasm

    translated = translated.replace(
        "OPENQASM 3.0;",
        "OPENQASM 2.0;"
    )

    translated = translated.replace(
        'include "stdgates.inc";',
        'include "qelib1.inc";'
    )

    translated = re.sub(
        r"\bqubit\s*\[\s*(\d+)\s*\]\s+([A-Za-z_]\w*)\s*;",
        r"qreg \2[\1];",
        translated,
    )

    translated = re.sub(
        r"\bbit\s*\[\s*(\d+)\s*\]\s+([A-Za-z_]\w*)\s*;",
        r"creg \2[\1];",
        translated,
    )

    return translated


def load_circuit(qasm: str) -> QuantumCircuit:
    qasm = normalize_qasm(qasm)

    if qasm.upper().startswith("OPENQASM 3"):
        try:
            return qasm3.loads(qasm)
        except Exception:
            translated = translate_openqasm3_to_qasm2(qasm)
            return QuantumCircuit.from_qasm_str(translated)

    return QuantumCircuit.from_qasm_str(qasm)


# =========================================================
# IBM SERVICE
# =========================================================

def get_service() -> QiskitRuntimeService:
    token = os.getenv("IBM_API_KEY")

    if not token:
        raise ValueError("IBM_API_KEY not configured.")

    kwargs = {
        "channel": os.getenv(
            "IBM_RUNTIME_CHANNEL",
            "ibm_quantum_platform"
        ),
        "token": token,
    }

    instance = os.getenv("IBM_INSTANCE_CRN")

    if instance:
        kwargs["instance"] = instance

    return QiskitRuntimeService(**kwargs)


# =========================================================
# BACKEND SUMMARY (LIGHTWEIGHT)
# =========================================================

def backend_summary(backend: Any) -> Dict[str, Any]:

    try:
        status = backend.status()
    except Exception:
        status = None

    return {
        "name": backend.name,
        "qubits": getattr(backend, "num_qubits", None),
        "num_qubits": getattr(backend, "num_qubits", None),
        "status": (
            "operational"
            if getattr(status, "operational", False)
            else "offline"
        ),
        "operational": getattr(status, "operational", False),
        "queue_length": getattr(status, "pending_jobs", None),
        "version": getattr(backend, "backend_version", None),
    }


# =========================================================
# BACKEND LIST CACHE
# =========================================================

def list_backends(payload: Dict[str, Any]) -> Dict[str, Any]:

    global BACKEND_CACHE
    global BACKEND_CACHE_TIME

    current_time = time.time()

    # Use cache if valid
    if (
        BACKEND_CACHE is not None
        and current_time - BACKEND_CACHE_TIME < BACKEND_CACHE_TTL
    ):
        return BACKEND_CACHE

    qubits = int(payload.get("minQubits") or 1)

    service = get_service()

    backends = service.backends(
        simulator=False,
        operational=True,
        min_num_qubits=qubits,
    )

    ordered = sorted(
        backends,
        key=lambda backend: (
            getattr(
                getattr(
                    backend,
                    "status",
                    lambda: None
                )(),
                "pending_jobs",
                10**9
            ),
            backend.name,
        ),
    )

    result = {
        "devices": [
            backend_summary(backend)
            for backend in ordered
        ]
    }

    BACKEND_CACHE = result
    BACKEND_CACHE_TIME = current_time

    return result


# =========================================================
# BACKEND SELECTION
# =========================================================

def choose_backend(
    service: QiskitRuntimeService,
    qubits_required: int,
    requested_backend: Optional[str] = None,
):

    if requested_backend:
        backend = service.backend(requested_backend)

        if getattr(backend, "num_qubits", 0) < qubits_required:
            raise ValueError(
                f"Backend {backend.name} "
                f"does not have enough qubits."
            )

        return backend

    backends = service.backends(
        simulator=False,
        operational=True,
        min_num_qubits=qubits_required,
    )

    if not backends:
        raise ValueError(
            "No operational backend available."
        )

    backends.sort(
        key=lambda backend: getattr(
            backend.status(),
            "pending_jobs",
            10**9,
        )
    )

    return backends[0]


# =========================================================
# SIMULATOR (LAZY IMPORT)
# =========================================================

def run_simulator(
    circuit: QuantumCircuit,
    shots: int,
    backend_name: str = "aer_simulator"
) -> Dict[str, Any]:

    # MEMORY OPTIMIZATION:
    # Only import Aer when actually needed
    from qiskit_aer import AerSimulator

    simulator = AerSimulator()

    transpiled = transpile(
        circuit,
        simulator,
        optimization_level=1,
    )

    result = simulator.run(
        transpiled,
        shots=min(shots, MAX_SIMULATOR_SHOTS),
    ).result()

    counts = result.get_counts()

    counts = {
        str(k): int(v)
        for k, v in counts.items()
    }

    return {
        "status": "completed",
        "mode": "simulator",
        "backend": backend_name,
        "counts": counts,
        "result": {
            "type": "sampler",
            "source": "local_simulator",
            "counts": counts,
        },
    }


# =========================================================
# VALIDATION
# =========================================================

def validate(payload: Dict[str, Any]) -> Dict[str, Any]:

    qasm = normalize_qasm(
        payload.get("qasm", "")
    )

    if not qasm:
        raise ValueError("QASM empty.")

    circuit = load_circuit(qasm)
    circuit = ensure_measurements(circuit)

    return {
        "ok": True,
        "normalizedQasm": qasm,
        "qubits": circuit.num_qubits,
        "depth": circuit.depth(),
        "gateCount": len(circuit.data),
        "hasMeasurements": True,
    }


# =========================================================
# EXECUTION
# =========================================================

def execute_job(payload: Dict[str, Any]) -> Dict[str, Any]:

    validation = validate(payload)

    qasm = validation["normalizedQasm"]

    circuit = load_circuit(qasm)
    circuit = ensure_measurements(circuit)

    requested_shots = int(
        payload.get("shots") or 1024
    )

    shots = max(
        1,
        min(requested_shots, MAX_HARDWARE_SHOTS)
    )

    requested_backend = payload.get("backend")
    allow_fallback = bool(
        payload.get("allowFallback", True)
    )

    try:

        service = get_service()

        backend = choose_backend(
            service,
            circuit.num_qubits,
            requested_backend,
        )

        pm = generate_preset_pass_manager(
            backend=backend,
            optimization_level=1,
        )

        transpiled = pm.run(circuit)

        sampler = Sampler(mode=backend)

        job = sampler.run(
            [transpiled],
            shots=shots,
        )

        return {
            "status": "queued",
            "mode": "hardware",
            "jobId": job.job_id(),
            "backend": backend.name,
            "backendSummary": backend_summary(
                backend
            ),
            "shots": shots,
            "qubits": transpiled.num_qubits,
            "transpiledDepth": transpiled.depth(),
        }

    except Exception as exc:

        if not allow_fallback:
            raise

        simulator_result = run_simulator(
            circuit,
            requested_shots,
        )

        simulator_result["failureReason"] = str(exc)

        return simulator_result


# =========================================================
# REFRESH JOB
# =========================================================

def refresh_job(payload: Dict[str, Any]) -> Dict[str, Any]:

    job_id = payload.get("jobId")

    if not job_id:
        raise ValueError("jobId required.")

    service = get_service()

    job = service.job(job_id)

    status = str(job.status())

    response = {
        "jobId": job_id,
        "status": status,
        "backend": (
            getattr(job.backend(), "name", None)
            if job.backend()
            else None
        ),
    }

    if status == "DONE":

        result = job.result()

        pub_result = result[0]

        counts = {}

        try:
            data = getattr(pub_result, "data", None)

            if data:

                raw = json_safe(data)

                if isinstance(raw, dict):

                    for value in raw.values():

                        if isinstance(value, dict):

                            counts = {
                                str(k): int(v * 1000)
                                for k, v in value.items()
                            }

                            break

        except Exception:
            counts = {}

        response["result"] = {
            "type": "sampler",
            "source": "ibm_runtime",
            "counts": counts,
        }

        return response

    if status == "ERROR":

        try:
            error_message = job.error_message()
        except Exception:
            error_message = "Unknown IBM Runtime error."

        response["errorMessage"] = error_message

        return response

    return response


# =========================================================
# MAIN
# =========================================================

def main():

    if len(sys.argv) < 2:
        emit({
            "ok": False,
            "error": "Action required."
        }, code=1)

    action = sys.argv[1]

    payload = read_input()

    try:

        if action == "validate":
            emit({
                "ok": True,
                "data": validate(payload)
            })

        if action == "execute_job":
            emit({
                "ok": True,
                "data": execute_job(payload)
            })

        if action == "refresh_job":
            emit({
                "ok": True,
                "data": refresh_job(payload)
            })

        if action == "list_backends":
            emit({
                "ok": True,
                "data": list_backends(payload)
            })

        emit({
            "ok": False,
            "error": f"Unsupported action: {action}"
        }, code=1)

    except Exception as exc:

        emit({
            "ok": False,
            "error": str(exc),
            "traceback": traceback.format_exc(),
        }, code=1)


if __name__ == "__main__":
    main()
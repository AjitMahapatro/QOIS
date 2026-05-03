// backend/utils/circuitIntelligence.js
// ES module. Lightweight Circuit Intelligence Layer (Option A).
// Purpose: validate and do minimal repairs / checks on submitted OPENQASM 3
// Exports: prepareQasm({ rawQasm, requestedBackend }) -> { ok, qasm, qubits, warnings, error }

export function parseQubitCount(qasm) {
  // Find either "qubit[<n>]" or "q[<n>]" or "qubit <name>[<n>]" patterns and also "qubit<digits>" not needed.
  // Return number of qubits inferred (highest index + 1)
  let maxIndex = -1;
  const idxRegex = /(?:qubit|q)\s*\[\s*(\d+)\s*\]/gi;
  let m;
  while ((m = idxRegex.exec(qasm)) !== null) {
    const idx = parseInt(m[1], 10);
    if (idx > maxIndex) maxIndex = idx;
  }

  // Also find declarations like: qubit[3] q;  (already covered), but check for "qubit[3] q;" pattern where 3 is size (not index)
  const decRegex = /qubit\[\s*(\d+)\s*\]\s+[a-zA-Z_]\w*/gi;
  while ((m = decRegex.exec(qasm)) !== null) {
    const size = parseInt(m[1], 10);
    if (!Number.isNaN(size)) {
      if (size - 1 > maxIndex) maxIndex = size - 1;
    }
  }

  // fallback: if a leading "qubit N q;" pattern (OPENQASM style sometimes differs) try another pattern:
  const dec2 = /qubit\s+(\d+)\s+[a-zA-Z_]\w*/gi;
  while ((m = dec2.exec(qasm)) !== null) {
    const size = parseInt(m[1], 10);
    if (!Number.isNaN(size)) {
      if (size - 1 > maxIndex) maxIndex = size - 1;
    }
  }

  return maxIndex + 1; // if no qubits found, returns 0
}

function ensureHeader(rawQasm) {
  let q = rawQasm.trim();
  // If doesn't start with OPENQASM 3.0, add it
  if (!/^OPENQASM\s+3/i.test(q)) {
    q = 'OPENQASM 3.0;\n' + q;
  }
  // ensure stdgates included
  if (!/include\s+["']stdgates\.inc["']/i.test(q)) {
    // add include after first line if there's a version line, else at top
    if (/^OPENQASM\s+3/i.test(q)) {
      q = q.replace(/^OPENQASM\s+3(?:\.[\d]+)?\s*;/i, match => `${match}\ninclude "stdgates.inc";`);
    } else {
      q = 'include "stdgates.inc";\n' + q;
    }
  }
  return q;
}

function ensureMeasurements(qasm, qubits) {
  // Check if there is any "measure" in qasm
  if (/measure\s+/i.test(qasm)) return { qasm, inserted: false };

  // Insert measurement for each qubit into bit registers (simple approach).
  // We'll add a classical bit register and measure each qubit into it at the end.
  // If there's already a classical register we try to detect it; else create `bit[<n>] c;` and measure: c[i] = meas q[i];
  let additions = `\n// auto-inserted measurements by Circuit Intelligence Layer\nbit[${qubits}] c;\n`;
  for (let i = 0; i < qubits; i++) {
    additions += `c[${i}] = measure q[${i}];\n`;
  }
  return { qasm: qasm + '\n' + additions, inserted: true };
}

function findUnsupportedGates(qasm, supported = null) {
  // Minimal list of common gates we'll consider supported for OPENQASM -> stdgates: h, x, y, z, rx, ry, rz, cx, cz, swap, measure, reset
  // This function finds tokens that look like gate names and are not in the supported set.
  const defaultSupported = new Set([
    'h','x','y','z','rx','ry','rz','cx','cz','ccx','measure','reset','swap','u','u1','u2','u3','sdg','tdg','s','t'
  ]);
  const sup = supported ? new Set(supported.map(s => s.toLowerCase())) : defaultSupported;

  // Simple regex to capture gate-like words followed by whitespace + args or qindex, e.g., "H q[0];" or "cx q[0], q[1];"
  const gateRegex = /\b([a-zA-Z][a-zA-Z0-9_]*)\s*(?=\()/g; // captures function-like gates, e.g. rx( .. ) maybe
  const tokenRegex = /\b([a-zA-Z][a-zA-Z0-9_]*)\b/g;

  // Collect gate-like words from qasm lines that look like gate operations (not declarations)
  const unsupported = new Set();
  const lines = qasm.split('\n');
  for (const ln of lines) {
    // skip lines with include, qubit, bit, // comments, or measurement
    if (/^\s*(include|qubit|bit|\/\/|#|OPENQASM)/i.test(ln)) continue;
    // find tokens that could be gate names (before q indices or parentheses)
    const tokens = ln.match(tokenRegex);
    if (!tokens) continue;
    // token[0] might be gate name
    for (const tk of tokens) {
      const tkl = tk.toLowerCase();
      // skip variable names like q, c, identifiers - but if followed by '[' in the line, it's likely a register, not gate
      // Heuristic: if token is followed by a space and then "q[" or "q[" occurs later - difficult; we'll trust token heuristic.
      // We'll only flag tokens that are alpha-only and not in supported set and not common keywords.
      if (/[a-z]/i.test(tk) && !sup.has(tkl)) {
        // avoid common keywords
        if (!['if','else','for','while','include','measure','bit','qubit','scope','let','const'].includes(tkl)) {
          // Also ensure token appears followed by q[ or qspace or '(' to be considered gate usage
          const pattern = new RegExp(`\\b${tk}\\b\\s*(?:\\(|q\\[|[a-zA-Z_])`, 'i');
          if (pattern.test(ln)) {
            unsupported.add(tk);
          }
        }
      }
    }
  }
  return Array.from(unsupported);
}

/**
 * Prepare QASM: minimal validation, header, measurement insertion, qubit count and checks.
 * requestedBackend: { name, qubits } (optional) - used for compatibility check
 */
export function prepareQasm({ rawQasm = '', requestedBackend = null }) {
  const warnings = [];
  if (typeof rawQasm !== 'string' || rawQasm.trim().length === 0) {
    return { ok: false, error: 'Empty QASM submitted.' };
  }

  // ensure header and include
  let qasm = ensureHeader(rawQasm);

  // infer qubits
  const qubits = parseQubitCount(qasm);
  if (qubits <= 0) {
    // if we couldn't infer, try to find declaration "qubit[<N>] q;"
    const decMatch = qasm.match(/qubit\s*\[\s*(\d+)\s*\]/i);
    if (decMatch) {
      qasm = qasm; // leave
    } else {
      // if still no, fail: need explicit qubit declaration or at least qubit indices
      // Try to detect lines like "q[0]" to infer; parseQubitCount covers that
      warnings.push('Could not detect explicit qubit declarations. Please ensure you declared qubit registers or used q[n] indices.');
    }
  }

  // if requestedBackend provided, check capacity
  if (requestedBackend && Number.isInteger(requestedBackend.qubits)) {
    if (qubits > requestedBackend.qubits) {
      return { ok: false, error: `Requested backend ${requestedBackend.name || ''} supports ${requestedBackend.qubits} qubits but circuit uses ${qubits}.` };
    }
  }

  // ensure measurement insertion
  const measureResult = ensureMeasurements(qasm, Math.max( qubits, 1 ));
  qasm = measureResult.qasm;
  if (measureResult.inserted) warnings.push('No measurement found, auto-inserted measurements for all qubits.');

  // detect unsupported gates
  const unsupported = findUnsupportedGates(qasm);
  if (unsupported.length) {
    warnings.push('Unsupported or unknown gate tokens detected: ' + unsupported.join(', ') + '. Please check; we will still attempt to submit but this may fail on hardware.');
  }

  // final qubit recalc (after possible inserted register)
  const finalQubits = parseQubitCount(qasm);
  return {
    ok: true,
    qasm,
    qubits: finalQubits,
    warnings,
  };
}

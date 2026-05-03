import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BRIDGE_PATH = path.resolve(__dirname, "../python/runtime_bridge.py");
const PYTHON_BIN = process.env.PYTHON_BIN || "python";

function runBridge(action, payload = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON_BIN, [BRIDGE_PATH, action], {
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      let parsed;

      try {
        parsed = stdout ? JSON.parse(stdout) : null;
      } catch {
        parsed = null;
      }

      if (code !== 0 || !parsed?.ok) {
        const error = new Error(
          parsed?.error || stderr || `Python bridge failed during ${action}.`
        );
        error.details = parsed || null;
        error.stderr = stderr;
        reject(error);
        return;
      }

      resolve(parsed.data);
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

export const validateRuntimeCircuit = (payload) =>
  runBridge("validate", payload);

export const submitRuntimeJob = (payload) =>
  runBridge("execute_job", payload);

export const refreshRuntimeJob = (payload) =>
  runBridge("refresh_job", payload);

export const listRuntimeBackends = (payload) =>
  runBridge("list_backends", payload);

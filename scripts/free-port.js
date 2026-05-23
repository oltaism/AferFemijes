/**
 * Frees a TCP port before starting dev (Windows-friendly).
 * Usage: node scripts/free-port.js 3000
 */
const { execSync } = require("child_process");

const port = process.argv[2] || "3000";

function freeOnWindows(p) {
  try {
    const out = execSync(`netstat -ano | findstr :${p}`, {
      encoding: "utf8",
    });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed.includes("LISTENING") && !trimmed.includes("ESTABLISHED")) {
        continue;
      }
      const parts = trimmed.split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid) && pid !== "0") {
        pids.add(pid);
      }
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* port free — findstr returns exit 1 */
  }
}

function freeOnUnix(p) {
  try {
    execSync(`lsof -ti:${p} | xargs kill -9 2>/dev/null`, {
      stdio: "inherit",
      shell: true,
    });
  } catch {
    /* port already free */
  }
}

try {
  if (process.platform === "win32") {
    freeOnWindows(port);
  } else {
    freeOnUnix(port);
  }
  console.log(`Port ${port} is ready.`);
} catch (e) {
  console.warn(`Could not free port ${port}:`, e.message);
}

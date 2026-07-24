// Production smoke check: boots the *built* server (`node dist/index.js`) and
// hits /health. Exists because dev (tsx) and tests (vitest) both transpile on
// the fly and can hide a broken production build — this can't. Run after build.
import { spawn } from "node:child_process";

const port = process.env.SMOKE_PORT ?? "3999";
const child = spawn("node", ["dist/index.js"], {
  env: { ...process.env, PORT: port },
  stdio: "inherit",
});

let serverExited = false;
child.on("exit", () => {
  serverExited = true;
});

const deadline = Date.now() + 10_000;
let ok = false;
while (Date.now() < deadline && !serverExited) {
  try {
    const res = await fetch(`http://localhost:${port}/health`);
    const body = await res.json();
    if (res.ok && body.status === "ok") {
      ok = true;
      break;
    }
  } catch {
    // server not accepting connections yet — retry until the deadline
  }
  await new Promise((r) => setTimeout(r, 250));
}

child.kill();
console.log(
  ok
    ? "[smoke] OK — built server answered /health"
    : "[smoke] FAILED — no healthy response from built server",
);
process.exit(ok ? 0 : 1);

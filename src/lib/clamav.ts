import { Socket } from "node:net";
import { spawn } from "node:child_process";

export type HealthStatus = {
  engine: "clamd" | "clamscan" | "none";
  healthy: boolean;
  status: "ok" | "degraded" | "disabled" | "unavailable";
  message: string;
};

export type ScanResult = {
  engine: "clamd" | "clamscan" | "none";
  status: "clean" | "infected" | "error" | "skipped";
  signature?: string;
  raw?: string;
};

function envBool(name: string, def: boolean = false): boolean {
  const v = process.env[name];
  if (!v) return def;
  const t = v.trim().toLowerCase();
  return t === "1" || t === "true" || t === "yes" || t === "on";
}

const CLAMAV_DISABLED = envBool("CLAMAV_DISABLED", false);
const CLAMAV_HOST = process.env.CLAMAV_HOST || "127.0.0.1";
const CLAMAV_PORT = parseInt(process.env.CLAMAV_PORT || "3310", 10);
const CLAMAV_TIMEOUT_MS = parseInt(process.env.CLAMAV_TIMEOUT_MS || "4000", 10);
const CLAMAV_MAX_BYTES = parseInt(process.env.CLAMAV_MAX_BYTES || String(25 * 1024 * 1024), 10);

export async function health(): Promise<HealthStatus> {
  if (CLAMAV_DISABLED) {
    return { engine: "none", healthy: true, status: "disabled", message: "ClamAV disabled via CLAMAV_DISABLED" };
  }
  // Prefer clamd
  try {
    const pong = await clamdPing();
    if (pong) return { engine: "clamd", healthy: true, status: "ok", message: "clamd reachable" };
  } catch {}
  // Fallback to clamscan
  try {
    const ver = await clamscanVersion();
    if (ver) return { engine: "clamscan", healthy: true, status: "degraded", message: "clamscan available: " + ver };
  } catch {}
  return { engine: "none", healthy: false, status: "unavailable", message: "No ClamAV engine detected" };
}

function clamdPing(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return; done = true;
      try { socket.destroy(); } catch {}
      ok ? resolve(true) : reject(new Error("No PONG"));
    };
    const to = setTimeout(() => finish(false), CLAMAV_TIMEOUT_MS);
    socket.connect(CLAMAV_PORT, CLAMAV_HOST, () => {
      socket.write("PING
");
    });
    socket.on("data", (buf) => {
      clearTimeout(to);
      const text = buf.toString("utf8");
      finish(text.includes("PONG"));
    });
    socket.on("error", () => { clearTimeout(to); finish(false); });
    socket.on("timeout", () => { clearTimeout(to); finish(false); });
  });
}

function clamscanVersion(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const proc = spawn("clamscan", ["--version"]);
    let out = ""; let err = "";
    proc.stdout.on("data", (d) => out += String(d));
    proc.stderr.on("data", (d) => err += String(d));
    proc.on("error", (e) => reject(e));
    proc.on("close", (code) => {
      if (code === 0 && out.trim()) resolve(out.trim()); else resolve(null);
    });
  });
}

export async function scanBuffer(buf: Buffer): Promise<ScanResult> {
  if (CLAMAV_DISABLED) {
    return { engine: "none", status: "skipped", raw: "Disabled via CLAMAV_DISABLED" };
  }
  if (buf.length > CLAMAV_MAX_BYTES) {
    return { engine: "none", status: "error", raw: "File too large for scan" };
  }
  // Try clamd INSTREAM first
  try {
    const r = await clamdScanInstream(buf);
    return r;
  } catch {}
  // Fallback to clamscan CLI
  try {
    const r = await clamscanScan(buf);
    return r;
  } catch {}
  return { engine: "none", status: "error", raw: "No ClamAV engine available" };
}

function clamdScanInstream(buf: Buffer): Promise<ScanResult> {
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    let responded = false;
    const fail = (e: any) => { if (responded) return; responded = true; try { socket.destroy(); } catch {} reject(e instanceof Error ? e : new Error(String(e))); };
    const ok = (r: ScanResult) => { if (responded) return; responded = true; try { socket.end(); socket.destroy(); } catch {} resolve(r); };

    socket.connect(CLAMAV_PORT, CLAMAV_HOST, () => {
      socket.write("INSTREAM
");
      const CHUNK = 1024 * 64;
      for (let i = 0; i < buf.length; i += CHUNK) {
        const chunk = buf.subarray(i, Math.min(i + CHUNK, buf.length));
        const size = Buffer.alloc(4);
        size.writeUInt32BE(chunk.length, 0);
        socket.write(size);
        socket.write(chunk);
      }
      const zero = Buffer.alloc(4);
      zero.writeUInt32BE(0, 0);
      socket.write(zero);
    });

    socket.on("data", (data) => {
      const text = data.toString("utf8").trim();
      const raw = text;
      let status: ScanResult["status"] = "error";
      let signature: string | undefined = undefined;
      if (text.endsWith("OK")) {
        status = "clean";
      } else if (text.endsWith("FOUND")) {
        status = "infected";
        const idx = text.indexOf(":");
        if (idx !== -1) {
          const after = text.substring(idx + 1).trim();
          signature = after.replace(/FOUND$/, "").trim();
        }
      } else if (/SIZE EXCEEDED|ERROR/i.test(text)) {
        status = "error";
      }
      ok({ engine: "clamd", status, signature, raw });
    });
    socket.on("error", fail);
    socket.on("timeout", () => fail(new Error("clamd socket timeout")));
  });
}

function clamscanScan(buf: Buffer): Promise<ScanResult> {
  return new Promise((resolve, reject) => {
    const proc = spawn("clamscan", ["-", "--no-summary"]);
    let out = ""; let err = "";
    proc.stdout.on("data", (d) => out += String(d));
    proc.stderr.on("data", (d) => err += String(d));
    proc.on("error", (e) => reject(e));
    proc.on("close", (code) => {
      const text = (out || err || "").trim();
      if (!text) return resolve({ engine: "clamscan", status: code === 0 ? "clean" : "error", raw: "" });
      if (/^stdin: OK$/m.test(text)) { return resolve({ engine: "clamscan", status: "clean", raw: text }); }
      const m = text.match(/^stdin: (.+) FOUND$/m);
      if (m) { return resolve({ engine: "clamscan", status: "infected", signature: m[1], raw: text }); }
      resolve({ engine: "clamscan", status: code === 0 ? "clean" : "error", raw: text });
    });
    proc.stdin.write(buf);
    proc.stdin.end();
  });
}

export function readableScanStatus(res: ScanResult): string {
  if (res.status === "infected") return "Infected: " + (res.signature || "unknown signature");
  if (res.status === "clean") return "Clean";
  if (res.status === "skipped") return "Skipped";
  return "Error";
}

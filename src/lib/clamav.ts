// Minimal ClamAV TCP client for clamd (no extra deps)
// Provides safe defaults and clear error states.

import * as net from "node:net";

export type ClamConfig = {
  host: string;
  port: number;
  timeoutMs?: number;
};

export type ClamPing = {
  ok: boolean;
  raw: string;
};

export type ClamScanResult = {
  infected: boolean;
  signature?: string;
  raw: string;
};

export function detectConfig(): { configured: boolean; config?: ClamConfig; reason?: string } {
  const host = process.env.CLAMAV_HOST?.trim();
  const port = Number(process.env.CLAMAV_PORT || 3310);
  if (!host) return { configured: false, reason: "missing_env" };
  if (!Number.isFinite(port) || port <= 0) return { configured: false, reason: "invalid_port" };
  return { configured: true, config: { host, port, timeoutMs: 4000 } };
}

function readUntilClose(socket: net.Socket): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    socket.setEncoding("utf8");
    socket.on("data", (chunk: string) => { data += chunk; });
    socket.on("error", reject);
    socket.on("close", () => resolve(data));
  });
}

export async function ping(cfg: ClamConfig): Promise<ClamPing> {
  const socket = net.connect({ host: cfg.host, port: cfg.port });
  socket.setTimeout(cfg.timeoutMs ?? 4000, () => socket.destroy(new Error("timeout")));
  const resultP = readUntilClose(socket);
  socket.write("PING
");
  socket.end();
  const raw = await resultP.catch((e: any) => String(e?.message || e));
  return { ok: /PONG/.test(raw), raw };
}

export async function scanBuffer(buf: Buffer, cfg: ClamConfig): Promise<ClamScanResult> {
  const socket = net.connect({ host: cfg.host, port: cfg.port });
  socket.setTimeout(cfg.timeoutMs ?? 8000, () => socket.destroy(new Error("timeout")));

  const resultP = readUntilClose(socket);

  // clamd INSTREAM protocol: send command, then length-prefixed chunks, then 0-length
  socket.write("INSTREAM
");
  const chunk = 8192;
  for (let i = 0; i < buf.length; i += chunk) {
    const part = buf.subarray(i, Math.min(i + chunk, buf.length));
    const len = Buffer.alloc(4);
    len.writeUInt32BE(part.length, 0);
    socket.write(len);
    socket.write(part);
  }
  const zero = Buffer.alloc(4);
  zero.writeUInt32BE(0, 0);
  socket.write(zero);
  socket.end();

  const raw = await resultP.catch((e: any) => String(e?.message || e));
  // Example: "stream: OK" or "stream: Eicar-Test-Signature FOUND"
  const infected = /FOUND/.test(raw);
  const match = raw.match(/stream: ([^ ]+) FOUND/);
  return { infected, signature: match?.[1], raw };
}

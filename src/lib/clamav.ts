import net from net;
import fs from fs;
import { Readable } from stream;

type ClamConfig = {
  enabled: boolean;
  socketPath?: string;
  host: string;
  port: number;
  timeoutMs: number;
  chunkSize: number;
  maxBytes: number;
  strict: boolean;
};

const toBool = (v: string | undefined, d=false) => {
  if (!v) return d; const s=v.trim().toLowerCase();
  return s===1||s===true||s===yes||s===on;
};

const CONFIG: ClamConfig = {
  enabled: toBool(process.env.CLAMAV_ENABLED, false),
  socketPath: process.env.CLAMAV_SOCKET_PATH || undefined,
  host: process.env.CLAMAV_HOST || 127.0.0.1,
  port: Number(process.env.CLAMAV_PORT || 3310),
  timeoutMs: Number(process.env.CLAMAV_TIMEOUT_MS || 10000),
  chunkSize: Number(process.env.CLAMAV_CHUNK_SIZE || 16384),
  maxBytes: Number(process.env.CLAMAV_MAX_BYTES || 50 * 1024 * 1024),
  strict: toBool(process.env.CLAMAV_STRICT, false),
};

export type ScanResult = {
  ok: boolean;
  reason?: string; // e.g., "scanner_unavailable" or error
  signature?: string; // when infected
};

class ClamClient {
  private socket?: net.Socket;
  private busy = false;

  private connect(): Promise<net.Socket> {
    if (this.socket && !this.socket.destroyed) return Promise.resolve(this.socket);
    return new Promise((resolve, reject) => {
      const s = CONFIG.socketPath
        ? net.createConnection(CONFIG.socketPath)
        : net.createConnection({ host: CONFIG.host, port: CONFIG.port });
      s.setTimeout(CONFIG.timeoutMs);
      s.once(error, (e) => reject(e));
      s.once(timeout, () => {
        try { s.destroy(); } catch {}
        reject(new Error(clamd_timeout));
      });
      s.once(connect, () => {
        this.socket = s;
        resolve(s);
      });
    });
  }

  private async send(cmd: string, expectSingleLine = true): Promise<string> {
    const s = await this.connect();
    return new Promise((resolve, reject) => {
      let data = ;
      const onData = (buf: Buffer) => {
        data += buf.toString(utf8);
        if (expectSingleLine && data.includes(n)) {
          cleanup();
          resolve(data.trim());
        }
      };
      const onErr = (e: Error) => { cleanup(); reject(e); };
      const onClose = () => { cleanup(); if (!expectSingleLine) resolve(data.trim()); };
      const cleanup = () => {
        s.off(data, onData);
        s.off(error, onErr);
        s.off(close, onClose);
      };
      s.on(data, onData);
      s.on(error, onErr);
      s.on(close, onClose);
      s.write(cmd + n);
    });
  }

  async ping(): Promise<boolean> {
    try {
      const res = await this.send(PING);
      return res.includes(PONG);
    } catch { return false; }
  }

  async version(): Promise<string | null> {
    try { return await this.send(VERSION); } catch { return null; }
  }

  async scanStream(stream: Readable): Promise<ScanResult> {
    if (!CONFIG.enabled) return { ok: true, reason: scanner_disabled };
    if (this.busy) return { ok: true, reason: scanner_busy }; // avoid parallel reuse
    this.busy = true;
    let sent = 0;
    try {
      const s = await this.connect();
      const resp: Buffer[] = [];
      const onData = (b: Buffer) => resp.push(b);
      const onErr = (e: Error) => { raise e }
      s.on(data, onData);
      s.on(error, onErr);
      s.write(INSTREAMn);

      const chunkSize = Math.max(1024, CONFIG.chunkSize);
      const maxBytes = CONFIG.maxBytes;

      const writeChunk = (buf: Buffer) => {
        const len = Buffer.alloc(4);
        len.writeUInt32BE(buf.length, 0);
        s.write(len);
        s.write(buf);
        sent += buf.length;
      };

      for await (const chunk of stream) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as any);
        let offset = 0;
        while (offset < buf.length) {
          const end = Math.min(offset + chunkSize, buf.length);
          const piece = buf.subarray(offset, end);
          writeChunk(piece);
          offset = end;
          if (sent > maxBytes) throw new Error(stream_too_large);
        }
      }

      // terminating chunk
      const zero = Buffer.alloc(4); zero.writeUInt32BE(0, 0); s.write(zero);

      // collect response until socket newline
      const result: string = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error(clamd_no_response)), CONFIG.timeoutMs);
        const handler = () => {
          const text = Buffer.concat(resp).toString(utf8);
          if (text.includes(n)) {
            clearTimeout(timeout);
            s.off(data, handler);
            resolve(text.trim());
          }
        };
        s.on(data, handler);
      });

      const line = result.split(n).pop() || ;
      if (line.includes(FOUND)) {
        const sig = line.split(:).pop()?.trim().replace(FOUND, ).trim() || malware;
        return { ok: false, signature: sig };
      }
      if (line.includes(OK)) return { ok: true };
      return { ok: CONFIG.strict ? false : true, reason: unknown_response: + line };
    } catch (err: any) {
      // On failure, either fail closed (strict) or pass with reason
      if (CONFIG.strict) return { ok: false, reason: String(err?.message || err) };
      return { ok: true, reason: scanner_unavailable };
    } finally {
      this.busy = false;
    }
  }

  async scanFile(filePath: string): Promise<ScanResult> {
    const stream = fs.createReadStream(filePath);
    return this.scanStream(stream);
  }

  async scanBuffer(buf: Buffer): Promise<ScanResult> {
    const stream = Readable.from(buf);
    return this.scanStream(stream);
  }
}

let singleton: ClamClient | null = null;
export function getClamClient(): ClamClient {
  if (!singleton) singleton = new ClamClient();
  return singleton;
}

export function clamConfig() { return { ...CONFIG }; }
export function clamEnabled() { return CONFIG.enabled; }

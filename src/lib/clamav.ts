import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import net from 'net';

export type ClamEngine = 'clamd' | 'clamscan' | 'none';

export interface ClamDetect {
  engine: ClamEngine;
  ready: boolean;
  reason?: string;
  details?: string;
}

const DEFAULTS = {
  mode: (process.env.CLAMAV_MODE || 'auto').toLowerCase(),
  clamdHost: process.env.CLAMD_HOST || '127.0.0.1',
  clamdPort: Number(process.env.CLAMD_PORT || 3310),
  clamscanPath: process.env.CLAMSCAN_PATH || 'clamscan',
  timeoutMs: Number(process.env.CLAMAV_TIMEOUT_MS || 5000),
};

function withTimeout<T>(p: Promise<T>, ms: number, reason = 'timeout'): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(reason)), ms);
    p.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}

async function pingClamd(host: string, port: number, timeoutMs: number): Promise<boolean> {
  return withTimeout(new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    let done = false;
    const finish = (ok: boolean) => { if (!done) { done = true; try { socket.destroy(); } catch {} resolve(ok); } };
    socket.setNoDelay(true);
    socket.on('connect', () => {
      try { socket.write('PING\n'); } catch { finish(false); }
    });
    socket.on('data', (chunk) => {
      const txt = chunk.toString('utf8');
      if (txt.includes('PONG')) finish(true);
    });
    socket.on('error', () => finish(false));
    socket.on('end', () => finish(false));
    socket.on('close', () => finish(done));
  }), timeoutMs, 'clamd-ping-timeout');
}

async function hasClamscan(bin: string, timeoutMs: number): Promise<boolean> {
  return withTimeout(new Promise((resolve) => {
    try {
      const proc = spawn(bin, ['--version']);
      let sawOutput = false;
      proc.stdout.on('data', () => { sawOutput = true; });
      proc.stderr.on('data', () => {});
      proc.on('error', () => resolve(false));
      proc.on('close', (code) => resolve(code === 0 || sawOutput));
    } catch {
      resolve(false);
    }
  }), timeoutMs, 'clamscan-detect-timeout').catch(() => false);
}

export async function detectClamAV(): Promise<ClamDetect> {
  const cfg = DEFAULTS;
  if (cfg.mode === 'disabled' || cfg.mode === 'off') {
    return { engine: 'none', ready: false, reason: 'disabled' };
  }
  if (cfg.mode === 'clamd' || cfg.mode === 'auto') {
    try {
      if (await pingClamd(cfg.clamdHost, cfg.clamdPort, Math.min(cfg.timeoutMs, 1500))) {
        return { engine: 'clamd', ready: true };
      }
    } catch {}
  }
  if (cfg.mode === 'clamscan' || cfg.mode === 'auto') {
    if (await hasClamscan(cfg.clamscanPath, Math.min(cfg.timeoutMs, 2000))) {
      return { engine: 'clamscan', ready: true };
    }
  }
  return { engine: 'none', ready: false, reason: 'not_found' };
}

export interface ScanResult {
  clean: boolean;
  infected: boolean;
  malware?: string;
  engine: ClamEngine;
  error?: string;
}

async function scanWithClamd(buffer: Buffer, host: string, port: number, timeoutMs: number): Promise<ScanResult> {
  return withTimeout(new Promise<ScanResult>((resolve) => {
    const socket = net.createConnection({ host, port });
    let resolved = false;
    const finish = (res: ScanResult) => { if (!resolved) { resolved = true; try { socket.destroy(); } catch {} resolve(res); } };

    socket.on('connect', () => {
      try {
        socket.write('INSTREAM\n');
        const chunkSize = 8192;
        for (let offset = 0; offset < buffer.length; offset += chunkSize) {
          const slice = buffer.subarray(offset, Math.min(offset + chunkSize, buffer.length));
          const header = Buffer.alloc(4);
          header.writeUInt32BE(slice.length, 0);
          socket.write(header);
          socket.write(slice);
        }
        const zero = Buffer.alloc(4); // zero-length terminator
        zero.writeUInt32BE(0, 0);
        socket.write(zero);
      } catch (e: any) {
        finish({ clean: false, infected: false, engine: 'clamd', error: e?.message || 'stream_error' });
      }
    });

    let buf = '';
    socket.on('data', (data) => { buf += data.toString('utf8'); });
    socket.on('error', (e) => finish({ clean: false, infected: false, engine: 'clamd', error: String(e) }));
    socket.on('end', () => {
      const out = buf.trim();
      // Typical: stream: OK or stream: Eicar-Test-Signature FOUND
      if (/\bOK\b/.test(out)) return finish({ clean: true, infected: false, engine: 'clamd' });
      const m = out.match(/stream:\s*(.+)\s+FOUND/i);
      if (m) return finish({ clean: false, infected: true, malware: m[1], engine: 'clamd' });
      return finish({ clean: false, infected: false, engine: 'clamd', error: out || 'unknown_response' });
    });
  }), timeoutMs, 'clamd-scan-timeout');
}

async function scanWithClamscan(buffer: Buffer, bin: string, timeoutMs: number): Promise<ScanResult> {
  const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'clamav-'));
  const filePath = path.join(tmpDir, 'blob.bin');
  await fs.promises.writeFile(filePath, buffer);
  return withTimeout(new Promise<ScanResult>((resolve) => {
    try {
      const proc = spawn(bin, ['--no-summary', filePath]);
      let out = '';
      proc.stdout.on('data', (d) => { out += d.toString('utf8'); });
      proc.stderr.on('data', () => {});
      proc.on('error', (e) => resolve({ clean: false, infected: false, engine: 'clamscan', error: String(e) }));
      proc.on('close', (code) => {
        const txt = out.trim();
        if (code === 0) return resolve({ clean: true, infected: false, engine: 'clamscan' });
        if (code === 1) {
          // Example: /tmp/blob.bin: Eicar-Test-Signature FOUND
          const m = txt.match(/:\s*(.+)\s+FOUND/i);
          return resolve({ clean: false, infected: true, malware: m ? m[1] : undefined, engine: 'clamscan' });
        }
        return resolve({ clean: false, infected: false, engine: 'clamscan', error: `exit_${code}: ${txt}` });
      });
    } catch (e: any) {
      resolve({ clean: false, infected: false, engine: 'clamscan', error: e?.message || 'spawn_error' });
    }
  }), timeoutMs, 'clamscan-scan-timeout');
}

export async function scanBuffer(buffer: Buffer, opts?: Partial<{ timeoutMs: number }>): Promise<ScanResult> {
  const cfg = DEFAULTS;
  const det = await detectClamAV();
  if (!det.ready) return { clean: false, infected: false, engine: 'none', error: det.reason || 'not_ready' };
  const timeoutMs = Math.max(1000, Math.min(30000, opts?.timeoutMs ?? cfg.timeoutMs));
  if (det.engine === 'clamd') return scanWithClamd(buffer, cfg.clamdHost, cfg.clamdPort, timeoutMs);
  if (det.engine === 'clamscan') return scanWithClamscan(buffer, cfg.clamscanPath, timeoutMs);
  return { clean: false, infected: false, engine: 'none', error: 'no_engine' };
}

export function eicarBuffer(): Buffer {
  const eicar = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
  return Buffer.from(eicar, 'utf8');
}

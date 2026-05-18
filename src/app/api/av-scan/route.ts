import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { spawn } from 'child_process';

export const runtime = 'nodejs';
export const maxDuration = 30;

type ScanResult = { status: 'clean' | 'infected' | 'unavailable' | 'error'; code?: string; message?: string; engine?: string; details?: string };

function ok(body: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' }, ...init });
}

function err(status: number, body: any) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

async function writeTempFile(data: Buffer): Promise<string> {
  const dir = tmpdir();
  const name = 'avscan-' + String(randomUUID());
  const p = join(dir, name);
  await fs.writeFile(p, data);
  return p;
}

function candidates(): Array<{ cmd: string; args: string[]; engine: string }> {
  return [
    { cmd: process.env.CLAMSCAN_PATH || 'clamscan', args: ['--no-summary'], engine: 'clamscan' },
    { cmd: process.env.CLAMDSCAN_PATH || 'clamdscan', args: ['--no-summary'], engine: 'clamdscan' },
  ];
}

async function run(cmd: string, baseArgs: string[], filePath: string, timeoutMs: number): Promise<{ exitCode: number|null, stdout: string, stderr: string, timedOut: boolean }>{
  return new Promise((resolve) => {
    const child = spawn(cmd, [...baseArgs, filePath]);
    let stdout = '';
    let stderr = '';
    let done = false;

    const to = setTimeout(() => {
      if (!done) {
        done = true;
        try { child.kill('SIGKILL'); } catch {}
        resolve({ exitCode: null, stdout, stderr: stderr + '\nTIMEOUT', timedOut: true });
      }
    }, Math.max(1000, timeoutMs));

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('error', (e: any) => {
      if (!done) {
        done = true;
        clearTimeout(to);
        const code = e && (e as any).code === 'ENOENT' ? -127 : -1;
        resolve({ exitCode: code as any, stdout, stderr: String(e), timedOut: false });
      }
    });

    child.on('close', (code) => {
      if (!done) {
        done = true;
        clearTimeout(to);
        resolve({ exitCode: code, stdout, stderr, timedOut: false });
      }
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const limit = Number(process.env.SCAN_MAX_BYTES || 10 * 1024 * 1024);
    const timeoutMs = Number(process.env.SCAN_TIMEOUT_MS || 15000);

    let body: any = null;
    const ct = req.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      body = await req.json();
    } else {
      const buf = Buffer.from(await req.arrayBuffer());
      body = { data: buf.toString('base64') };
    }

    let dataBuf: Buffer | null = null;
    if (typeof (body && body.data) === 'string') {
      try { dataBuf = Buffer.from(body.data, 'base64'); } catch {}
    }
    if (!dataBuf && typeof (body && body.text) === 'string') {
      dataBuf = Buffer.from(String(body.text), 'utf-8');
    }

    if (!dataBuf) {
      return err(400, { status: 'error', code: 'BAD_REQUEST', message: 'Provide base64  or ' } as ScanResult);
    }

    if (dataBuf.byteLength > limit) {
      return err(413, { status: 'error', code: 'PAYLOAD_TOO_LARGE', message: 'Payload exceeds limit' } as ScanResult);
    }

    const tempPath = await writeTempFile(dataBuf);

    let lastErr: string | undefined;
    for (const e of candidates()) {
      const r = await run(e.cmd, e.args, tempPath, timeoutMs);
      if (r.exitCode === -127) {
        lastErr = 'engine ' + e.engine + ' not found';
        continue;
      }
      if (r.timedOut) {
        await fs.unlink(tempPath).catch(() => {});
        return ok({ status: 'error', code: 'ENGINE_TIMEOUT', message: 'Engine timed out', engine: e.engine, details: r.stderr } as ScanResult);
      }
      if (r.exitCode === 0) {
        await fs.unlink(tempPath).catch(() => {});
        return ok({ status: 'clean', engine: e.engine, details: r.stdout } as ScanResult);
      }
      if (r.exitCode === 1) {
        await fs.unlink(tempPath).catch(() => {});
        return ok({ status: 'infected', engine: e.engine, details: r.stdout } as ScanResult);
      }
      lastErr = r.stderr || ('exitCode=' + String(r.exitCode));
    }

    await fs.unlink(tempPath).catch(() => {});
    return ok({ status: 'unavailable', code: 'ENGINE_UNAVAILABLE', message: lastErr || 'No ClamAV engine available' } as ScanResult);
  } catch (e: any) {
    return err(500, { status: 'error', code: 'UNEXPECTED', message: (e && e.message) || String(e) } as ScanResult);
  }
}

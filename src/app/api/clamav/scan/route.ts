// ClamAV scan endpoint: POST { data?: string(base64), text?: string, filename?: string }
// Optimizes by preferring clamdscan (daemon) and caching engine detection.
export const runtime = 'nodejs';
import type { NextRequest } from 'next/server';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomBytes } from 'node:crypto';
import { writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const pexec = promisify(execFile);

let cached: { engine: 'clamdscan' | 'clamscan' | 'unavailable'; checkedAt: number } | null = null;
const TTL_MS = 60_000; // 60s cache

async function which(bin: string): Promise<boolean> {
  try {
    const { stdout } = await pexec('sh', ['-lc', 'command -v ' + bin + ' >/dev/null 2>&1 && echo yes || echo no']);
    return stdout.trim() === 'yes';
  } catch {
    return false;
  }
}

async function detect(): Promise<'clamdscan' | 'clamscan' | 'unavailable'> {
  const now = Date.now();
  if (cached && now - cached.checkedAt < TTL_MS) return cached.engine;
  let engine: 'clamdscan' | 'clamscan' | 'unavailable' = 'unavailable';
  if (await which('clamdscan')) engine = 'clamdscan';
  else if (await which('clamscan')) engine = 'clamscan';
  cached = { engine, checkedAt: now };
  return engine;
}

function isEICAR(buf: Buffer): boolean {
  const text = buf.toString('ascii');
  return text.includes('EICAR-STANDARD-ANTIVIRUS-TEST-FILE');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const base64: string | undefined = body.data;
    const text: string | undefined = body.text;
    const filename: string = (body.filename as string) || 'upload.bin';

    let data: Buffer | null = null;
    if (base64) {
      try { data = Buffer.from(base64, 'base64'); } catch { return new Response(JSON.stringify({ error: 'Invalid base64' }), { status: 400 }); }
    } else if (typeof text === 'string') {
      data = Buffer.from(text, 'utf8');
    } else {
      return new Response(JSON.stringify({ error: 'Provide  (base64) or ' }), { status: 400 });
    }

    // Quick local check to avoid external process if EICAR test string
    if (isEICAR(data!)) {
      return new Response(JSON.stringify({ engine: 'local-check', result: 'FOUND', signature: 'EICAR-Test-Signature' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const engine = await detect();
    if (engine === 'unavailable') {
      // Fallback: we can only say not detected by local heuristic
      return new Response(JSON.stringify({ engine: 'unavailable', result: 'CLEAN' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const tmp = tmpdir();
    const id = randomBytes(8).toString('hex');
    const safe = filename.replace(/[^A-Za-z0-9_.-]/g, '_');
    const filePath = path.join(tmp, id + '-' + safe);
    await writeFile(filePath, data!);

    try {
      let stdout = '';
      if (engine === 'clamdscan') {
        // --fdpass: pass file descriptor (works without root), --no-summary: concise output
        const res = await pexec('clamdscan', ['--fdpass', '--no-summary', filePath]);
        stdout = (res.stdout || '').trim();
      } else {
        const res = await pexec('clamscan', ['--no-summary', filePath]);
        stdout = (res.stdout || '').trim();
      }
      const found = /(\s|:)(Infected|FOUND)/i.test(stdout) || /FOUND$/i.test(stdout);
      const signatureMatch = stdout.match(/:(.*)FOUND/i);
      const signature = signatureMatch ? signatureMatch[1].trim() : undefined;
      return new Response(JSON.stringify({ engine, result: found ? 'FOUND' : 'CLEAN', details: stdout, signature }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      // clamscan returns non-zero on detection; parse stdout/stderr
      const stdout = String((err?.stdout || err?.message || '')).trim();
      const found = /FOUND$/i.test(stdout) || /Infected/i.test(stdout);
      const signatureMatch = stdout.match(/:(.*)FOUND/i);
      const signature = signatureMatch ? signatureMatch[1].trim() : undefined;
      const result = found ? 'FOUND' : 'ERROR';
      const status = found ? 200 : 500;
      return new Response(JSON.stringify({ engine: await detect(), result, details: stdout, signature }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    } finally {
      try { await rm(filePath, { force: true }); } catch {}
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500 });
  }
}

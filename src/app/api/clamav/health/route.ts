// ClamAV health endpoint with simple in-memory cache
export const runtime = 'nodejs';
import type { NextRequest } from 'next/server';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const pexec = promisify(execFile);

let cached: { engine: string; version?: string; checkedAt: number } | null = null;
const TTL_MS = 60_000; // 60s cache to avoid repeated process spawns

async function has(bin: string): Promise<boolean> {
  try {
    const { stdout } = await pexec('sh', ['-lc', 'command -v ' + bin + ' >/dev/null 2>&1 && echo yes || echo no']);
    return stdout.trim() === 'yes';
  } catch {
    return false;
  }
}

async function detectEngine(): Promise<{ engine: string; version?: string }> {
  const now = Date.now();
  if (cached && now - cached.checkedAt < TTL_MS) {
    return { engine: cached.engine, version: cached.version };
  }
  let engine = 'unavailable';
  let version: string | undefined = undefined;

  if (await has('clamdscan')) {
    engine = 'clamdscan';
    try {
      const { stdout } = await pexec('clamdscan', ['--version']);
      version = (stdout || '').split('
')[0].trim();
    } catch {}
  } else if (await has('clamscan')) {
    engine = 'clamscan';
    try {
      const { stdout } = await pexec('clamscan', ['--version']);
      version = (stdout || '').split('
')[0].trim();
    } catch {}
  }

  cached = { engine, version, checkedAt: now };
  return { engine, version };
}

export async function GET(_req: NextRequest) {
  try {
    const info = await detectEngine();
    return new Response(JSON.stringify({ status: 'ok', ...info }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'error', message: String(err?.message || err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

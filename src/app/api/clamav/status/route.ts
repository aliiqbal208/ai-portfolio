export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { spawnSync } from 'node:child_process';

function which(cmd: string): string | null {
  const res = spawnSync('bash', ['-lc', `command -v ${cmd} || true`], { encoding: 'utf-8' });
  const out = (res.stdout || '').trim();
  return out ? out.split('
')[0] : null;
}

function versionOf(bin: string): string | null {
  const res = spawnSync(bin, ['--version'], { encoding: 'utf-8' });
  const out = ((res.stdout || '') + (res.stderr || '')).trim();
  return out ? out.split('
')[0] : null;
}

export async function GET() {
  const preferClamd = process.env.CLAMDSCAN_PATH || 'clamdscan';
  const preferClam = process.env.CLAMSCAN_PATH || 'clamscan';

  let engine: 'clamdscan' | 'clamscan' | 'none' = 'none';
  let binary: string | null = null;
  let version: string | null = null;

  const clamd = which(preferClamd);
  if (clamd) {
    engine = 'clamdscan';
    binary = clamd;
    version = versionOf(clamd);
  } else {
    const clam = which(preferClam);
    if (clam) {
      engine = 'clamscan';
      binary = clam;
      version = versionOf(clam);
    }
  }

  const ok = engine !== 'none';
  return NextResponse.json({ ok, engine, binary, version }, { status: 200 });
}

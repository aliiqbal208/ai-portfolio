import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (process.env.ENABLE_CLAMAV_SCAN_API !== 'true') {
    return NextResponse.json({ error: 'disabled' }, { status: 404 });
  }
  return new Promise((resolve) => {
    const proc = spawn('python', ['scripts/clamav_scan.py'], { env: process.env, cwd: process.cwd() });
    let out = '';
    let err = '';
    proc.stdout.on('data', (d) => (out += d.toString()))
    proc.stderr.on('data', (d) => (err += d.toString()))
    proc.on('close', (code) => {
      try {
        const json = JSON.parse(out || '{}');
        resolve(NextResponse.json({ code, ...json }));
      } catch (e) {
        resolve(NextResponse.json({ code, out, err }, { status: 500 }));
      }
    });
    proc.on('error', () => resolve(NextResponse.json({ error: 'spawn failed' }, { status: 500 })));
  });
}

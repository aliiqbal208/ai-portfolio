export const runtime = 'nodejs';
import { NextRequest } from 'next/server';
import { pingClamd } from '@/lib/clamav';
import { spawnSync } from 'child_process';

export async function GET(_req: NextRequest) {
  const clamd = await pingClamd().catch(() => false);
  let clamscan = false;
  try {
    const r = spawnSync(process.env.CLAMSCAN_PATH || 'clamscan', ['-V'], { timeout: 1500 });
    clamscan = r.status === 0 || (r.stdout?.toString() || '').length > 0;
  } catch {}
  const engine = clamd ? 'clamd' : clamscan ? 'clamscan' : 'none';
  const available = engine !== 'none';
  return new Response(JSON.stringify({ available, engine }), { status: 200, headers: { 'content-type': 'application/json' } });
}

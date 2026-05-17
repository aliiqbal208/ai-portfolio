import { NextRequest } from 'next/server';
import { pingClamAV, versionClamAV } from '@/lib/clamav';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  try {
    const health = await pingClamAV(800);
    const version = await versionClamAV(800);
    const body = JSON.stringify({ ok: health.configured && health.reachable, ...health, version });
    return new Response(body, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err?.message || 'unexpected_error' }), { status: 500 });
  }
}

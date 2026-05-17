import { NextRequest } from 'next/server';
import { getClamdConfig, clamdPing } from '@/lib/clamav';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const { configured, config } = getClamdConfig();
  if (!configured || !config) {
    return Response.json({ ok: true, configured: false });
  }
  try {
    const result = await clamdPing(config);
    return Response.json({ ok: true, configured: true, reachable: result.reachable, pong: result.pong });
  } catch (err: any) {
    return Response.json({ ok: true, configured: true, reachable: false, error: err?.message || 'unknown' }, { status: 200 });
  }
}


import { NextRequest } from 'next/server';
import { detectClamAV } from '@/lib/clamav';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const health = detectClamAV();
  return new Response(JSON.stringify({ ok: true, ...health }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

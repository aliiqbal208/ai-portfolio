
import { NextRequest } from 'next/server';
import { detectClamAV } from '@/lib/clamav';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const status = await detectClamAV();
  return new Response(JSON.stringify({ ok: true, antivirus: status }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

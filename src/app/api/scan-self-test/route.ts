export const runtime = 'nodejs'

import { envOptions, scanBufferWithClamAV } from '@/lib/clamav';

export async function GET() {
  try {
    const buf = Buffer.from('clamav-self-test');
    const res = await scanBufferWithClamAV(buf, envOptions());
    return new Response(JSON.stringify({ ok: true, ...res }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err?.message || 'unknown' }), { status: 500 });
  }
}

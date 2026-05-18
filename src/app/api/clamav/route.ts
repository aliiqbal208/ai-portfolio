
import { pingClamAV, scanBase64, clamConfig } from '@/lib/clamav';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 15;

export async function GET() {
  const { enabled } = clamConfig();
  const ping = await pingClamAV();
  return new Response(
    JSON.stringify({ ok: ping.ok, enabled, reason: ping.reason }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}

export async function POST(req: Request) {
  const { enabled } = clamConfig();
  let base64 = '';
  try {
    const body = await req.json();
    base64 = typeof (body && body.base64) === 'string' ? body.base64 : '';
  } catch {}
  if (!base64) {
    return new Response(JSON.stringify({ error: 'missing base64' }), { status: 400 });
  }
  const result = await scanBase64(base64);
  return new Response(
    JSON.stringify({ ...result, enabled }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}

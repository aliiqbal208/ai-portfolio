import { clamavAvailability, pingClamd, scanBuffer } from '@/lib/clamav';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

type Body = { data?: string; filename?: string };

function bad(msg: string, code = 400) {
  return Response.json({ ok: false, error: msg }, { status: code });
}

export async function POST(req: Request) {
  const avail = clamavAvailability();
  if (!avail.enabled) return bad('clamav_disabled', 503);
  const health = await pingClamd();
  if (!health.reachable) return bad('clamd_unreachable', 503);

  let body: Body;
  try { body = await req.json() as Body; } catch { return bad('invalid_json'); }
  const b64 = (body.data || '').trim();
  if (!b64) return bad('missing_field:data');

  const buf = Buffer.from(b64, 'base64');
  if (!buf.length) return bad('invalid_base64');
  if (buf.length > 10 * 1024 * 1024) return bad('file_too_large', 413);

  const res = await scanBuffer(buf).catch((e) => ({ status: 'ERROR', raw: String(e) } as const));
  return Response.json({ ok: true, result: res }, { status: 200 });
}

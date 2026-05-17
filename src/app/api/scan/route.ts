import { NextRequest, NextResponse } from next/server;
import { scanBuffer } from @/lib/clamav;

type ReqBody = { filename?: string; contentBase64?: string };

export async function POST(req: NextRequest) {
  const enabled = (process.env.SCAN_ENABLED || ).toLowerCase() === true;
  if (!enabled) {
    return NextResponse.json({ ok: false, enabled: false, reason: scanning_disabled }, { status: 501 });
  }

  let body: ReqBody | null = null;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: invalid_json }, { status: 400 });
  }

  const b64 = (body?.contentBase64 || ).trim();
  if (!b64) { return NextResponse.json({ ok: false, error: missing_content }, { status: 400 }); }

  let buffer: Buffer;
  try { buffer = Buffer.from(b64, base64); } catch {
    return NextResponse.json({ ok: false, error: invalid_base64 }, { status: 400 });
  }

  const result = await scanBuffer(buffer, { timeoutMs: 8000 });
  return NextResponse.json({ ok: true, verdict: result.verdict, signature: result.signature, durationMs: result.durationMs });
}

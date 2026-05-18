import { NextRequest } from 'next/server';
import { clamavEnabled, clamdPing, scanBuffer } from '@/lib/clamav';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 10 * 1024 * 1024; // 10MB guardrail

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const b64: string | undefined = body?.data;
    const text: string | undefined = body?.text;
    const metaName: string = String(body?.filename || 'stream');

    if (!b64 && !text) {
      return Response.json({ ok: false, error: 'missing_payload', details: 'Provide base64  or .' }, { status: 400 });
    }

    const payload = b64 ? Buffer.from(b64, 'base64') : Buffer.from(text!, 'utf8');
    if (!payload || !payload.length) {
      return Response.json({ ok: false, error: 'empty_payload' }, { status: 400 });
    }
    if (payload.length > MAX_BYTES) {
      return Response.json({ ok: false, error: 'payload_too_large', limit: MAX_BYTES }, { status: 413 });
    }

    if (!clamavEnabled()) {
      return Response.json({ ok: true, scanning: 'disabled', bytes: payload.length, filename: metaName });
    }

    const alive = await clamdPing();
    if (!alive) {
      const mode = (process.env.CLAMAV_ENABLED || 'auto').toLowerCase();
      if (mode === 'auto') {
        return Response.json({ ok: true, scanning: 'disabled', reason: 'clamd_unavailable_auto', bytes: payload.length, filename: metaName });
      }
      return Response.json({ ok: false, error: 'clamav_unavailable' }, { status: 503 });
    }

    const result = await scanBuffer(payload);
    if (result.status === 'found') {
      return Response.json({ ok: false, infected: true, signature: result.signature, raw: result.raw, filename: metaName }, { status: 200 });
    }
    if (result.status === 'ok') {
      return Response.json({ ok: true, infected: false, filename: metaName });
    }
    return Response.json({ ok: false, error: 'scan_error', raw: result.raw }, { status: 500 });
  } catch (e: any) {
    return Response.json({ ok: false, error: 'exception', message: String(e?.message || e) }, { status: 500 });
  }
}

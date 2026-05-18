import { NextResponse } from 'next/server';
import { scanBuffer, pingClamAV } from '@/lib/clamav';
export const runtime = 'nodejs';
export const maxDuration = 30;

function parseIntEnv(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

export async function POST(req: Request) {
  try {
    let body: ArrayBuffer | null = null;
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file');
      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        body = await (file as File).arrayBuffer();
      }
    } else {
      body = await req.arrayBuffer();
    }

    if (!body || (body as ArrayBuffer).byteLength === 0) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    const maxBytes = parseIntEnv('CLAMAV_MAX_BYTES', 25 * 1024 * 1024);
    if ((body as ArrayBuffer).byteLength > maxBytes) {
      return NextResponse.json({ error: 'payload too large', limit: maxBytes }, { status: 413 });
    }

    const hasClamd = !!(process.env.CLAMAV_HOST || process.env.CLAMAV_PORT);
    if (!hasClamd) {
      return NextResponse.json({ ok: false, reason: 'clamd_unavailable' }, { status: 501 });
    }

    const healthy = await pingClamAV().catch(() => false);
    if (!healthy) {
      return NextResponse.json({ ok: false, reason: 'clamd_unreachable' }, { status: 503 });
    }

    const buf = Buffer.from(body as ArrayBuffer);
    const result = await scanBuffer(buf);
    return NextResponse.json({ ok: result.status === 'OK', ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

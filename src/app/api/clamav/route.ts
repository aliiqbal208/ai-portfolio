import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'nodejs';

const CLAMAV_SCAN_URL = process.env.CLAMAV_SCAN_URL || '';
const CLAMAV_TIMEOUT_MS = Number(process.env.CLAMAV_TIMEOUT_MS || 10000);
const CLAMAV_MAX_BYTES = Number(process.env.CLAMAV_MAX_BYTES || 10 * 1024 * 1024); // 10 MB

export async function GET() {
  return NextResponse.json({
    configured: Boolean(CLAMAV_SCAN_URL),
    timeoutMs: CLAMAV_TIMEOUT_MS,
    maxBytes: CLAMAV_MAX_BYTES,
  });
}

export async function HEAD() {
  return new NextResponse(undefined, { status: Boolean(CLAMAV_SCAN_URL) ? 204 : 503 });
}

export async function POST(request: NextRequest) {
  if (!CLAMAV_SCAN_URL) {
    return NextResponse.json(
      { error: 'ClamAV scan endpoint not configured', code: 'not_configured' },
      { status: 501 }
    );
  }

  const contentType = request.headers.get('content-type') || 'application/octet-stream';

  const ab = await request.arrayBuffer();
  const buf = Buffer.from(ab);
  if (buf.byteLength === 0) {
    return NextResponse.json(
      { error: 'Empty request body', code: 'empty_body' },
      { status: 400 }
    );
  }
  if (buf.byteLength > CLAMAV_MAX_BYTES) {
    return NextResponse.json(
      { error: , code: 'payload_too_large' },
      { status: 413 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLAMAV_TIMEOUT_MS);
  try {
    const upstream = await fetch(CLAMAV_SCAN_URL, {
      method: 'POST',
      headers: { 'content-type': contentType, 'x-source': 'ai-portfolio' },
      body: buf,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const respContentType = upstream.headers.get('content-type') || '';
    if (respContentType.includes('application/json')) {
      const data = await upstream.json().catch(() => ({}));
      return NextResponse.json(data, { status: upstream.status });
    }
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'content-type': respContentType || 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    clearTimeout(timeout);
    const anyErr = err as any;
    const aborted = anyErr && (anyErr.name === 'AbortError' || anyErr.code === 'ABORT_ERR');
    return NextResponse.json(
      { error: aborted ? 'Scan timed out' : 'Upstream error', detail: String(err || '') },
      { status: aborted ? 504 : 502 }
    );
  }
}

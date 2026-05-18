import { NextRequest } from 'next/server';
import { healthCheck, scanBuffer } from '@/lib/clamav';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('health')) {
    const res = await healthCheck();
    return Response.json(res, { status: 200 });
  }
  return new Response('Not Found', { status: 404 });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let buf: Buffer | null = null;

    if (contentType.includes('application/json')) {
      const body: any = await req.json();
      if (body?.dataBase64) {
        try {
          buf = Buffer.from(String(body.dataBase64), 'base64');
        } catch (err: any) {
          return Response.json({ ok: false, status: 'error', reason: 'invalid_base64', engine: 'clamav' }, { status: 400 });
        }
      } else if (typeof body?.text === 'string') {
        buf = Buffer.from(body.text, 'utf8');
      }
    } else if (contentType.startsWith('text/')) {
      const text = await req.text();
      buf = Buffer.from(text, 'utf8');
    } else {
      // As a safe default, do not attempt to parse multipart here.
      const arrayBuf = await req.arrayBuffer();
      buf = Buffer.from(arrayBuf);
    }

    const res = await scanBuffer(buf || Buffer.alloc(0));
    return Response.json(res, { status: 200 });
  } catch (err: any) {
    return Response.json({ ok: false, status: 'error', reason: String(err?.message || 'unexpected_error'), engine: 'clamav' }, { status: 500 });
  }
}

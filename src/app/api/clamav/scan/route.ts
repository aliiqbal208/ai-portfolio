
// src/app/api/clamav/scan/route.ts
import { NextRequest } from 'next/server';
import { healthCheck, scanBuffer } from '@/lib/clamav';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const h = await healthCheck();
  return new Response(JSON.stringify({ status: 'ok', ...h }), { status: 200, headers: { 'content-type': 'application/json' } });
}

export async function POST(req: NextRequest) {
  const ctype = req.headers.get('content-type') || '';
  let buf: Buffer | null = null;
  if (ctype.startsWith('application/octet-stream')) {
    const ab = await req.arrayBuffer();
    buf = Buffer.from(ab);
  } else if (ctype.includes('application/json')) {
    const body: any = await req.json();
    if (typeof body?.base64 === 'string') {
      buf = Buffer.from(body.base64, 'base64');
    } else if (typeof body?.dataUrl === 'string') {
      const m = (body.dataUrl as string).match(/^data:[^;]+;base64,(.+)$/);
      if (m) buf = Buffer.from(m[1], 'base64');
    }
  }
  if (!buf) return new Response(JSON.stringify({ error: 'No content' }), { status: 400 });
  const result = await scanBuffer(buf);
  return new Response(JSON.stringify(result), { status: 200, headers: { 'content-type': 'application/json' } });
}

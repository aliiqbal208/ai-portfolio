import { NextRequest } from 'next/server';
import { Readable } from 'node:stream';
import { loadConfig, ping, scanStream } from '@/lib/clamav';

export const runtime = 'nodejs';

export async function GET() {
  const { mode } = loadConfig();
  if (!mode) {
    return Response.json({ configured: false, mode: null }, { status: 200 });
  }
  const res = await ping();
  return Response.json({ configured: res.ok, mode: res.mode, error: res.error || null }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const ct = req.headers.get('content-type') || '';
  let stream: Readable | null = null;
  let filename = 'upload.bin';

  if (ct.includes('multipart/form-data')) {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return Response.json({ error: 'missing_file' }, { status: 400 });
    }
    filename = (file as any).name || filename;
    // @ts-ignore - Node 20 provides Readable.fromWeb
    stream = Readable.fromWeb((file as Blob).stream());
  } else if (ct.includes('application/json')) {
    const body = await req.json().catch(() => ({}));
    const b64 = (body as any)?.base64 as string | undefined;
    if (!b64) return Response.json({ error: 'missing_base64' }, { status: 400 });
    const buf = Buffer.from(b64, 'base64');
    stream = Readable.from(buf);
  } else {
    return Response.json({ error: 'unsupported_content_type' }, { status: 415 });
  }

  const { cfg, mode } = loadConfig();
  if (!mode) {
    return Response.json({ status: 'skipped', reason: 'not_configured' }, { status: 200 });
  }

  const max = cfg.maxBytes ?? 25 * 1024 * 1024;
  let total = 0;
  const bounded = new Readable({
    read() {}
  });
  stream!.on('data', (chunk: Buffer) => {
    total += chunk.length;
    if (total <= max) {
      bounded.push(chunk);
    } else {
      // drop the rest
    }
  });
  stream!.once('end', () => bounded.push(null));
  stream!.once('error', (e) => bounded.destroy(e as any));

  const result = await scanStream(bounded);
  const http = result.status === 'error' ? 502 : 200;
  return Response.json({ file: filename, ...result }, { status: http });
}

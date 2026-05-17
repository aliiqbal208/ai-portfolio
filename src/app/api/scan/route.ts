export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const ct = String(req.headers.get('content-type') || '');
    let buf: Buffer;
    if (ct.includes('application/json')) {
      const body: any = await req.json();
      const text: string = typeof body.text === 'string' ? body.text : '';
      const b64: string = typeof body.base64 === 'string' ? body.base64 : '';
      if (b64) buf = Buffer.from(b64, 'base64');
      else if (text) buf = Buffer.from(text, 'utf8');
      else return Response.json({ error: 'missing data' }, { status: 400 });
    } else {
      const ab = await req.arrayBuffer();
      buf = Buffer.from(ab);
    }
    const mod = await import('../../../lib/clamav');
    const result = await (mod as any).scanBuffer(buf);
    return Response.json({
      ok: result.ok,
      engine: result.engine,
      infected: result.infected,
      signature: result.signature || null,
      bytes: result.bytes,
      reason: result.reason || null,
    });
  } catch (e: any) {
    return Response.json({ ok: false, error: 'scan_error' }, { status: 500 });
  }
}

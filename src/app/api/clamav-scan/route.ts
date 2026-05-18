import { NextRequest } from next/server;
import { scanBuffer } from @/lib/clamav;

export const runtime = nodejs;

export async function POST(request: NextRequest) {
  try {
    let buf: Buffer | null = null;
    let name = upload.bin;

    const contentType = request.headers.get(content-type) || ;
    if (contentType.includes(application/json)) {
      const body = await request.json().catch(() => ({} as any));
      if (body && typeof body.content === string) {
        buf = Buffer.from(body.content, body.base64 ? base64 : utf8);
        if (typeof body.filename === string) name = body.filename;
      }
    } else if (contentType.includes(multipart/form-data)) {
      const form = await request.formData();
      const file = form.get(file);
      if (file && typeof (file as any).arrayBuffer === function) {
        const ab = await (file as File).arrayBuffer();
        buf = Buffer.from(ab);
        name = (file as File).name || name;
      }
    }

    if (!buf) {
      return new Response(JSON.stringify({ ok: false, error: no-content }), { status: 400 });
    }

    const result = await scanBuffer(buf, name);
    return new Response(JSON.stringify({ ok: true, result }), { status: 200, headers: { content-type: application/json } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || unexpected-error }), { status: 500 });
  }
}

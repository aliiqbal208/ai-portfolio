import { NextRequest } from 'next/server';
import { scanBlobWithClamAV } from '@/lib/clamav';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const ctype = req.headers.get('content-type') || '';
    if (!ctype.includes('multipart/form-data')) {
      return Response.json({ error: 'expected multipart/form-data' }, { status: 400 });
    }
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof Blob)) {
      return Response.json({ error: 'missing file field' }, { status: 400 });
    }

    const result = await scanBlobWithClamAV(file);
    const base = { bytes: file.size, type: file.type || 'application/octet-stream' };

    if (result.status === 'infected') {
      return Response.json({ ...base, scan: result }, { status: 422 });
    }
    if (result.status === 'error') {
      // Graceful degradation: do not block; report skipped with reason.
      return Response.json({ ...base, scan: { status: 'skipped', reason: result.reason } }, { status: 200 });
    }
    // clean or skipped
    return Response.json({ ...base, scan: result }, { status: 200 });
  } catch (err: any) {
    return Response.json({ error: 'scan_failed', reason: String(err?.message || err) }, { status: 500 });
  }
}

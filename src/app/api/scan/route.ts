export const runtime = 'nodejs';

function env(name: string, fallback = ''): string {
  if (typeof process !== 'undefined' && process.env && process.env[name]) return String(process.env[name]);
  return fallback;
}

async function forwardToScanner(file: Blob): Promise<{ ok: boolean; status: string; details?: unknown }>{
  const url = env('CLAMAV_SCAN_URL', '').trim();
  if (!url) return { ok: true, status: 'skipped' };

  try {
    const form = new FormData();
    form.append('file', file, (file as any).name || 'upload.bin');
    const res = await fetch(url, { method: 'POST', body: form });
    const ctype = res.headers.get('content-type') || '';
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, status: 'scanner_error', details: { status: res.status, text } };
    }
    if (ctype.includes('application/json')) {
      const data = await res.json().catch(() => ({}));
      // Normalize a few common shapes to { ok, status }
      if (typeof data === 'object' && data) {
        const status = (data.status || data.result || data.outcome || 'clean') as string;
        const ok = Boolean((data.ok ?? (status !== 'infected')));
        return { ok, status, details: data };
      }
      return { ok: true, status: 'clean' };
    }
    // Fallback: plain text contains result
    const text = await res.text().catch(() => '');
    const lower = text.toLowerCase();
    const infected = lower.includes('infected') || lower.includes('virus found');
    return { ok: !infected, status: infected ? 'infected' : 'clean', details: text };
  } catch (err) {
    return { ok: false, status: 'scanner_unreachable', details: String(err) };
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const ctype = req.headers.get('content-type') || '';
    if (!ctype.includes('multipart/form-data')) {
      return Response.json(
        { ok: false, status: 'bad_request', message: 'multipart/form-data with field file is required' },
        { status: 400 }
      );
    }
    const form = await req.formData();
    const file = form.get('file');
    if (!file || !(file instanceof Blob)) {
      return Response.json(
        { ok: false, status: 'bad_request', message: 'missing file' },
        { status: 400 }
      );
    }

    const outcome = await forwardToScanner(file);
    const http = outcome.ok ? 200 : 502;
    return Response.json(outcome, { status: http });
  } catch (err) {
    return Response.json({ ok: false, status: 'error', message: String(err) }, { status: 500 });
  }
}

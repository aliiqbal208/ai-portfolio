export const runtime = 'nodejs';

export async function GET() {
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
    status: 405,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ ok: false, error: 'file field is required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }
    // Placeholder: ClamAV scanning is not implemented in this repo.
    // In production, stream the file to a backend (e.g., Go/clamd) and return the result.
    return new Response(JSON.stringify({ ok: false, error: 'scan not implemented in this repository' }), {
      status: 501,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid form data' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
}

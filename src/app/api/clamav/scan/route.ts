// Minimal placeholder for ClamAV scan endpoint.
// This repo has no Go server; advertise 501 Not Implemented clearly.

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await req.json().catch(() => ({}));
  } catch {}
  return Response.json(
    {
      error: 'ClamAV scan not implemented in this repository (no Go server present).',
      repoHasGoServer: false,
      action: 'Use the backend service that integrates ClamAV to perform scans.'
    },
    { status: 501 }
  );
}

export async function GET() {
  return new Response('Not Implemented', { status: 501 });
}

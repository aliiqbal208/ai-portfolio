import { NextRequest } from 'next/server';
import { health as clamHealth, scanByURL } from '@/lib/clamav';

export const maxDuration = 15;

export async function GET() {
  const h = clamHealth();
  // 200 even when not configured so probes remain green in non-secured envs
  return Response.json({ status: h.configured ? 'configured' : 'not_configured', mode: h.mode, details: h.details });
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response('Missing url', { status: 400 });
    }
    const result = await scanByURL(url);
    const status = result.ok ? 200 : 502;
    return Response.json(result, { status });
  } catch (err: any) {
    const message = err?.message || 'invalid_request';
    return new Response(message, { status: 400 });
  }
}

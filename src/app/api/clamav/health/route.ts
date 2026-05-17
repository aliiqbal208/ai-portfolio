import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const host = process.env.CLAMAV_HOST?.trim() || '';
  const portRaw = process.env.CLAMAV_PORT?.trim() || '';
  const port = portRaw ? Number(portRaw) : NaN;
  const timeoutMs = Number(process.env.CLAMAV_TIMEOUT_MS || '8000');

  const configured = Boolean(host) && Number.isFinite(port) && port > 0;

  const body = {
    service: 'clamav',
    enabled: configured,
    host: configured ? host : undefined,
    port: configured ? port : undefined,
    timeoutMs,
    reason: configured ? 'configured' : 'not_configured',
  } as const;

  return NextResponse.json(body, { status: 200 });
}

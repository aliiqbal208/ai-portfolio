export const runtime = 'nodejs';
import { getClamClient, clamEnabled } from '@/lib/clamav';

export async function GET() {
  const enabled = clamEnabled();
  if (!enabled) {
    return new Response(JSON.stringify({ enabled: false, configured: false }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  }
  try {
    const client = getClamClient();
    const ok = await client.ping();
    const version = await client.version();
    return new Response(
      JSON.stringify({ enabled: true, configured: true, connection: ok ? 'ok' : 'unavailable', version }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ enabled: true, configured: true, connection: 'unavailable' }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 },
    );
  }
}

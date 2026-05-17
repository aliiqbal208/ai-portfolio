
import { health, isEnabled } from '@/lib/clamav';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_req: Request) {
  try {
    const h = await health();
    return new Response(JSON.stringify(h), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({
        enabled: isEnabled(),
        reachable: false,
        error: (err as Error)?.message || String(err),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

import { clamavAvailability, pingClamd } from '@/lib/clamav';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const avail = clamavAvailability();
  let ping = { reachable: false, message: 'disabled' } as { reachable: boolean; message: string };
  if (avail.enabled) {
    ping = await pingClamd().catch(() => ({ reachable: false, message: 'error' }));
  }
  return Response.json({ ok: true, clamd: { ...avail, ...ping } }, { status: 200 });
}

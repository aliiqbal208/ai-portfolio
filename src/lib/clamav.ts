
export type ClamAVResult = { status: 'SKIPPED' | 'ERROR' | 'CLEAN' | 'INFECTED'; signature?: string; raw: string };
export function clamavConfigured(): boolean { return !!process.env.CLAMAV_HOST; }
export async function scanBufferWithClamAV(buffer: Buffer): Promise<ClamAVResult> {
  if (!clamavConfigured()) return { status: 'SKIPPED', raw: 'clamav:not_configured' };
  return { status: 'ERROR', raw: 'clamav:client_not_implemented' };
}

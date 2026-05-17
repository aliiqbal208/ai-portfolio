export type ClamavHealth = { enabled: boolean; reachable: boolean; message?: string };

export function isEnabled(): boolean {
  return Boolean(process.env.CLAMAV_HOST && process.env.CLAMAV_PORT);
}

export const DEFAULT_MAX_BYTES = Number(process.env.CLAMAV_MAX_BYTES || 25 * 1024 * 1024);

export async function healthHint(): Promise<ClamavHealth> {
  if (!isEnabled()) return { enabled: false, reachable: false, message: 'ClamAV not configured' };
  return { enabled: true, reachable: false, message: 'Connectivity not checked in this context' };
}

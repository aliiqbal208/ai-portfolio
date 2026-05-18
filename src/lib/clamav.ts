export type ClamResult = {
  status: 'OK' | 'FOUND' | 'ERROR';
  signature?: string;
  raw?: string;
};

export function clamavAvailability() {
  const enabled = (process.env.CLAMAV_ENABLED || '').toLowerCase();
  const host = process.env.CLAMAV_HOST || '127.0.0.1';
  const port = Number(process.env.CLAMAV_PORT || 3310);
  const isEnabled = enabled === '1' || enabled === 'true' || (!!process.env.CLAMAV_HOST);
  return { host, port, enabled: isEnabled } as const;
}

export async function pingClamd(): Promise<{ reachable: boolean; message: string }>{
  // In CI environments without clamd, report unreachable unless explicitly enabled.
  const { enabled } = clamavAvailability();
  return { reachable: false, message: enabled ? 'not_implemented' : 'disabled' };
}

export async function scanBuffer(_buf: Buffer): Promise<ClamResult> {
  // Placeholder implementation; returns OK when disabled.
  const { enabled } = clamavAvailability();
  return enabled ? { status: 'ERROR', raw: 'not_implemented' } : { status: 'OK', raw: 'disabled' };
}

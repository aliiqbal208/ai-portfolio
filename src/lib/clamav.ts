export type ClamStatus = {
  enabled: boolean;
  host?: string;
  port?: number;
};

function envBool(name: string, fallback = false): boolean {
  const v = (process.env[name] || '').trim().toLowerCase();
  if (!v) return fallback;
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

export function isClamAVEnabled(): boolean {
  if (envBool('CLAMAV_DISABLED', false)) return false;
  const host = process.env.CLAMAV_HOST || '';
  const port = process.env.CLAMAV_PORT || '';
  return Boolean(host.trim() && port.trim());
}

export function currentClamStatus(): ClamStatus {
  const enabled = isClamAVEnabled();
  const host = process.env.CLAMAV_HOST || undefined;
  const port = process.env.CLAMAV_PORT ? Number(process.env.CLAMAV_PORT) : undefined;
  return { enabled, host, port };
}

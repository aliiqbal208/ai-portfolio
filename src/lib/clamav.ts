
// src/lib/clamav.ts
export type ScanEngine = 'clamd' | 'clamscan' | 'noop';
export interface ScanResult { ok: boolean; infected: boolean; signature?: string; engine: ScanEngine; raw?: string }
export interface Health { backend: ScanEngine; clamd: { reachable: boolean; version?: string }; clamscan: { available: boolean; version?: string } }
const env = (k: string, d?: string) => (process.env[k] !== undefined ? (process.env[k] as string) : d);
const SCAN_MAX_BYTES = Number(env('SCAN_MAX_BYTES', '5242880'));
export async function healthCheck(): Promise<Health> {
  return { backend: 'noop', clamd: { reachable: false }, clamscan: { available: false } } as Health;
}
export async function scanBuffer(buf: Buffer): Promise<ScanResult> {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf as any);
  if (b.length > SCAN_MAX_BYTES) return { ok: false, infected: false, engine: 'noop', raw: 'Too large: ' + String(b.length) };
  return { ok: true, infected: false, engine: 'noop' };
}

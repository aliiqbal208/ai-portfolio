// Placeholder for future ClamAV integration. See docs/clamav-optimization.md.
export type ScanResult = { status: 'CLEAN' } | { status: 'INFECTED'; signature: string } | { status: 'ERROR'; message: string };
export async function scanBuffer(_buf: Buffer): Promise<ScanResult> {
  return { status: 'ERROR', message: 'clamd not configured' };
}

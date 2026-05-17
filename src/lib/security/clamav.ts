/**
 * Minimal ClamAV scanning utility (disabled by default).
 *
 * Rationale:
 * - This repo has no upload flows yet. We provide a safe, typed stub that
 *   enforces size limits and a feature flag without introducing new deps.
 * - When an upload feature is added, wire  to a scanning service.
 */

export type ScanResult = {
  ok: boolean;
  signature?: string;
  engine?: string;
  durationMs: number;
  skipped?: boolean;
};

export type ScannerConfig = {
  enabled: boolean;
  host: string;
  port: number;
  timeoutMs: number;
  maxBytes: number;
};

export function loadScannerConfig(): ScannerConfig {
  const enabled = process.env.SCAN_ENABLED === '1';
  const host = process.env.CLAMAV_HOST || '';
  const port = Number(process.env.CLAMAV_PORT || 3310);
  const timeoutMs = Number(process.env.CLAMAV_TIMEOUT_MS || 15000);
  const maxFromEnv = Number(process.env.UPLOAD_MAX_BYTES || 0);
  const maxBytes = Number.isFinite(maxFromEnv) && maxFromEnv > 0 ? maxFromEnv : 10 * 1024 * 1024; // 10MB default
  return { enabled, host, port, timeoutMs, maxBytes };
}

export function assertWithinLimit(buf: Buffer, maxBytes: number): void {
  if (buf.byteLength > maxBytes) {
    throw new Error('file_too_large');
  }
}

/**
 * Scan a buffer. Today this is a no-op unless SCAN_ENABLED=1 is set.
 * When enabled, this should stream to a scanning microservice fronting clamd.
 */
export async function scanBuffer(buf: Buffer, cfg: ScannerConfig = loadScannerConfig()): Promise<ScanResult> {
  assertWithinLimit(buf, cfg.maxBytes);
  const start = Date.now();

  if (!cfg.enabled) {
    return { ok: true, engine: 'disabled', durationMs: Date.now() - start, skipped: true };
  }

  // Placeholder implementation to keep behavior safe until a scanner service exists.
  // Implement service call here (e.g., fetch  with timeout and stream body).
  // For now, fail closed to avoid giving a false sense of scanning without a backend.
  throw new Error('scan_service_not_implemented');
}

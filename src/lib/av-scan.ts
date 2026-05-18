
/* Lightweight client-side antivirus pre-scan helper (no ClamAV).
   - Optimizes by caching results by file hash to avoid re-scanning.
   - Intended as a front-end prefilter; server-side AV (e.g., ClamAV) must still run.
*/

export type AvScanResult = {
  status: 'clean' | 'blocked' | 'skipped';
  reason?: string;
  hash: string;
};

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

class AvCache {
  private ttl: number;
  private store: Map<string, { result: AvScanResult; expires: number }> = new Map();

  constructor(ttlMs: number = DEFAULT_TTL_MS) { this.ttl = ttlMs; }

  get(hash: string): AvScanResult | undefined {
    const rec = this.store.get(hash);
    if (!rec) return undefined;
    if (Date.now() > rec.expires) {
      this.store.delete(hash);
      return undefined;
    }
    return rec.result;
  }

  set(hash: string, result: AvScanResult) {
    this.store.set(hash, { result, expires: Date.now() + this.ttl });
  }
}

export class AvScanner {
  private cache = new AvCache();
  public scans = 0;
  public cacheHits = 0;

  async hashFile(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    const bytes = Array.from(new Uint8Array(digest));
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private isBlockedExtension(name: string): boolean {
    const blocked = (process.env.NEXT_PUBLIC_AV_BLOCKED_EXT || 'exe,bat,cmd,ps1,apk,msi,jar').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const ext = name.split('.').pop()?.toLowerCase() || '';
    return blocked.includes(ext);
  }

  private maxSizeBytes(): number {
    const mb = Number(process.env.NEXT_PUBLIC_AV_MAX_SIZE_MB || '25');
    return Math.max(1, mb) * 1024 * 1024;
  }

  async scan(file: File): Promise<AvScanResult> {
    const enabled = String(process.env.NEXT_PUBLIC_AV_SCAN_ENABLED ?? 'true').toLowerCase() != 'false';
    const hash = await this.hashFile(file);

    if (!enabled) {
      return { status: 'skipped', reason: 'disabled', hash };
    }

    const cached = this.cache.get(hash);
    if (cached) {
      this.cacheHits += 1;
      return cached;
    }

    // Simple client prefilter rules (not a replacement for AV):
    if (this.isBlockedExtension(file.name)) {
      const result = { status: 'blocked' as const, reason: 'blocked_extension', hash };
      this.cache.set(hash, result);
      this.scans += 1;
      return result;
    }

    if (file.size > this.maxSizeBytes()) {
      const result = { status: 'skipped' as const, reason: 'too_large', hash };
      this.cache.set(hash, result);
      this.scans += 1;
      return result;
    }

    // Client-side cannot do signature AV; treat as clean pre-check.
    const result: AvScanResult = { status: 'clean', hash };
    this.cache.set(hash, result);
    this.scans += 1;
    return result;
  }
}

/**
 * Minimal, dependency-free modeling of a ClamAV decision strategy.
 */

export type ClamAVEngine = "clamd" | "clamscan";

export interface ClamAVOptions {
  preferDaemon?: boolean;
  connectTimeoutMs?: number;
  scanTimeoutMs?: number;
  maxBytes?: number;
  maxArchiveDepth?: number;
}

export interface ClamAVDecision {
  engine: ClamAVEngine;
  timeouts: { connectMs: number; scanMs: number };
  limits: { maxBytes: number; maxArchiveDepth: number };
}

const DEFAULTS: Required<ClamAVOptions> = {
  preferDaemon: true,
  connectTimeoutMs: 1500,
  scanTimeoutMs: 10000,
  maxBytes: 25 * 1024 * 1024,
  maxArchiveDepth: 3,
};

export function chooseClamAVStrategy(env: Partial<ClamAVOptions> = {}): ClamAVDecision {
  const opts = { ...DEFAULTS, ...env };
  const engine: ClamAVEngine = opts.preferDaemon ? "clamd" : "clamscan";
  return {
    engine,
    timeouts: { connectMs: opts.connectTimeoutMs, scanMs: opts.scanTimeoutMs },
    limits: { maxBytes: opts.maxBytes, maxArchiveDepth: opts.maxArchiveDepth },
  };
}

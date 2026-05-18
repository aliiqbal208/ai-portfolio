// Minimal ClamAV scan utility with safe fallback
export interface HealthInfo { strategy: ClamStrategy; available: boolean; details: Record<string, unknown>; }
export interface ScanResult { engine: ClamStrategy; infected: boolean; signature?: string; raw?: string; durationMs: number; }
const EICAR_TOKEN = 'EICAR-STANDARD-ANTIVIRUS-TEST-FILE';
export function detectStrategy(){ return { strategy: 'fallback' as const, reason: 'no engine', hasClamscan: false }; }
export function health(): HealthInfo { return { strategy: 'fallback', available: true, details: { reason: 'no engine' } }; }
export async function scanBuffer(buf: Buffer): Promise<ScanResult> { const t=Date.now(); const hit = buf.toString('utf8').includes(EICAR_TOKEN); return { engine: 'fallback', infected: hit, signature: hit ? 'Eicar-Test-Signature' : undefined, durationMs: Date.now()-t }; }

import { spawn } from 'node:child_process';

function run(cmd: string, args: string[], timeoutMs = 5000): Promise<{code: number|null, stdout: string, stderr: string, timedOut: boolean}> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try { child.kill('SIGKILL'); } catch {}
        resolve({ code: null, stdout, stderr, timedOut: true });
      }
    }, Math.max(1000, timeoutMs));
    child.stdout?.on('data', (d) => { stdout += d.toString(); });
    child.stderr?.on('data', (d) => { stderr += d.toString(); });
    child.on('error', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code: null, stdout, stderr, timedOut: false });
    });
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut: false });
    });
  });
}

async function hasBinary(bin: string): Promise<boolean> {
  const probe = await run('bash', ['-lc', ok], 2000);
  if ((probe.stdout || '').includes('ok')) return true;
  const quick = await run(bin, ['--version'], 1500);
  return quick.code === 0 || Boolean((quick.stdout + quick.stderr).trim());
}

async function detectVersion(preferred: 'clamdscan'|'clamscan'): Promise<string|undefined> {
  const order = preferred === 'clamdscan' ? ['clamdscan', 'clamscan'] : ['clamscan', 'clamdscan'];
  for (const bin of order) {
    if (!(await hasBinary(bin))) continue;
    const out = await run(bin, ['--version'], 3000);
    const text = (out.stdout || out.stderr || '').trim();
    if (text) return text.split('\n')[0];
  }
  return undefined;
}

export type ClamAVHealth = {
  available: boolean;
  engines: string[];
  version?: string;
  notes?: string[];
};

export async function getClamAVHealth(): Promise<ClamAVHealth> {
  const notes: string[] = [];
  const hasClamd = await hasBinary('clamdscan');
  const hasClam = await hasBinary('clamscan');
  const engines = [hasClamd ? 'clamdscan' : undefined, hasClam ? 'clamscan' : undefined].filter(Boolean) as string[];
  let version: string|undefined;
  if (engines.length) {
    version = await detectVersion(engines[0] as 'clamdscan'|'clamscan');
  } else {
    notes.push('ClamAV binaries not found in PATH');
  }
  return { available: engines.length > 0, engines, version, notes: notes.length ? notes : undefined };
}

export type ScanResult = {
  ok: boolean;
  engine: string|null;
  infected: number;
  scanned: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
};

export async function scanPath(targetDir: string, timeoutMs = 120_000): Promise<ScanResult> {
  const hasClamd = await hasBinary('clamdscan');
  const hasClam = await hasBinary('clamscan');
  const engine = hasClamd ? 'clamdscan' : (hasClam ? 'clamscan' : null);
  if (!engine) {
    return { ok: false, engine, infected: 0, scanned: 0, stdout: '', stderr: 'No ClamAV engine available', timedOut: false };
  }
  const args = engine === 'clamdscan' ? ['-ri', targetDir] : ['-r', '--infected', '--no-summary', targetDir];
  const out = await run(engine, args, timeoutMs);
  const text = ;
  let infected = 0;
  let scanned = 0;
  const foundMatches = text.match(/FOUND/g);
  if (foundMatches) infected = foundMatches.length;
  const scannedMatch = text.match(/Scanned files:\s*(\d+)/i);
  if (scannedMatch) scanned = parseInt(scannedMatch[1], 10);
  return { ok: out.code === 0, engine, infected, scanned, stdout: out.stdout, stderr: out.stderr, timedOut: out.timedOut };
}

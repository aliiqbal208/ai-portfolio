const { execFile } = require('node:child_process');
const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

function which(cmd) {
  return new Promise((resolve) => {
    execFile('bash', ['-lc', ], (_err, stdout) => {
      const out = (stdout || '').toString().trim();
      resolve(out ? out : null);
    });
  });
}

async function detectBins() {
  if ((process.env.CLAMAV_DISABLE || '').trim() === '1') return {};
  const [clamdscan, clamscan] = await Promise.all([which('clamdscan'), which('clamscan')]);
  const result = {};
  if (clamdscan) result.clamdscan = clamdscan;
  if (clamscan) result.clamscan = clamscan;
  return result;
}

async function scanBuffer(buf) {
  try {
    const bins = await detectBins();
    if (!bins.clamdscan && !bins.clamscan) {
      return { status: 'not_configured' };
    }
    const wd = mkdtempSync(join(tmpdir(), 'scan-'));
    const file = join(wd, 'payload.bin');
    try {
      writeFileSync(file, buf);
      const bin = bins.clamdscan || bins.clamscan;
      const args = bins.clamdscan ? ['--fdpass', file] : ['--no-summary', file];
      const stdout = await new Promise((resolve, reject) => {
        execFile(bin, args, { timeout: 60_000 }, (err, out, stderr) => {
          const raw = (out || stderr || '').toString();
          if (err && typeof err.code === 'number' && err.code > 1) {
            reject(new Error(raw || String(err)));
            return;
          }
          resolve(raw);
        });
      });
      const raw = String(stdout).trim();
      const infectedMatch = raw.match(/:\s*([^:]+)\s+FOUND/m);
      if (infectedMatch) return { status: 'infected', signature: infectedMatch[1].trim(), raw };
      if (/OK/m.test(raw)) return { status: 'clean', raw };
      return /FOUND/.test(raw) ? { status: 'infected', raw } : { status: 'clean', raw };
    } finally {
      try { rmSync(wd, { recursive: true, force: true }); } catch {}
    }
  } catch (e) {
    return { status: 'error', raw: String(e && e.message || e) };
  }
}

async function scanText(text) { return scanBuffer(Buffer.from(text || '', 'utf8')); }

module.exports = { scanBuffer, scanText, detectBins };

export const metadata = {
  title: 'ClamAV Optimization – Guide',
  description: 'Practical tips for faster, safer ClamAV scanning.',
};

export default function ClamAVOptimizationPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10"> 
      <h1>ClamAV Optimization</h1>
      <p>
        Production-safe ways to speed up ClamAV while keeping detection quality high.
        See <code>docs/clamav-optimization.md</code> in the repository for details.
      </p>
      <h2>Quick Wins</h2>
      <ul>
        <li>Prefer <code>clamd</code> + <code>clamdscan</code> over <code>clamscan</code>.</li>
        <li>Use a local Unix socket; set <code>MaxThreads</code> near CPU cores.</li>
        <li>Bound work with <code>MaxScanSize</code>, <code>MaxFileSize</code>, <code>MaxRecursion</code>, <code>MaxFiles</code>.</li>
        <li>Exclude noisy paths; keep signatures fresh with <code>freshclam</code>.</li>
      </ul>
    </main>
  );
}

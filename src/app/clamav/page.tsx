export const metadata = { title: 'ClamAV Scanning' };

export default function ClamavPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 prose dark:prose-invert">
      <h1>ClamAV Scanning Utility</h1>
      <p>
        This project includes a lightweight ClamAV scanning helper at <code>scripts/clamav_scan.py</code>.
      </p>
      <h2>Usage</h2>
      <pre><code>python scripts/clamav_scan.py path --json</code></pre>
      <h2>Environment</h2>
      <ul>
        <li><code>CLAMDSCAN_PATH</code> / <code>CLAMSCAN_PATH</code></li>
        <li><code>CLAM_TIMEOUT_SECS</code></li>
        <li><code>CLAM_MAX_FILE_MB</code></li>
        <li><code>CLAM_SCAN_ARCHIVES</code></li>
      </ul>
      <p className="text-sm opacity-80">Note: This page is informational and does not run scans in-browser.</p>
    </main>
  );
}

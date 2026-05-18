import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ClamAV Scanning Optimization — Portfolio Notes',
  description: 'Practical tips to speed up and right-size ClamAV scans without sacrificing safety.',
};

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 prose prose-neutral dark:prose-invert">
      <h1>ClamAV Scanning Optimization</h1>
      <p>These are practical, vendor-neutral notes for making ClamAV scanning faster and more predictable. Pick only what applies to your workload and risk model.</p>
      <h2>Use the daemon, not the CLI</h2>
      <ul>
        <li>Prefer <code>clamd</code> + <code>clamdscan</code> over repeated <code>clamscan</code> invocations.</li>
        <li>Keep the daemon warm; avoid cold starts per request.</li>
        <li>Place the socket on a fast local path; avoid remote sockets where possible.</li>
      </ul>
      <h2>Scope what you scan</h2>
      <ul>
        <li>Validate file type and size up-front; reject oversized or disallowed types before AV.</li>
        <li>Scan uploads and untrusted inputs only; skip trusted build artifacts and caches.</li>
        <li>Use allow-lists for directories and file extensions where appropriate.</li>
      </ul>
      <h2>Right-size limits</h2>
      <p>Adjust in <code>clamd.conf</code> to match your max upload sizes and archive depth:</p>
      <ul>
        <li><strong>MaxFileSize</strong> / <strong>StreamMaxLength</strong>: cap individual and streamed file sizes.</li>
        <li><strong>MaxScanSize</strong>: upper bound for total bytes scanned per file.</li>
        <li><strong>MaxRecursion</strong> / <strong>MaxFiles</strong>: bound archive depth and entry count.</li>
        <li>Fail safe: return a clear 4xx/5xx with reason when limits are exceeded.</li>
      </ul>
      <h2>Signature and engine hygiene</h2>
      <ul>
        <li>Update signatures on a timer, not per request; run <code>freshclam</code> via cron/systemd.</li>
        <li>Use official signatures first; add third-party sets judiciously to avoid false positives and bloat.</li>
        <li>Restart or reload <code>clamd</code> off-peak after large signature updates.</li>
      </ul>
      <h2>Concurrency and resources</h2>
      <ul>
        <li>Run one <code>clamd</code> per host by default; scale horizontally before oversubscribing CPU.</li>
        <li>Bound concurrent scans at the application edge (queue/back-pressure) to avoid CPU thrash.</li>
        <li>Use tmpfs/fast disks for temporary extraction if archives are common.</li>
      </ul>
      <h2>Developer ergonomics</h2>
      <ul>
        <li>Provide a toggle to bypass AV in local dev (never in prod) to keep feedback fast.</li>
        <li>Emit structured logs: filename, size, duration, decision (clean/infected/limited).</li>
        <li>Add metrics (p50/p95 latency, timeouts, limit hits) to guide tuning.</li>
      </ul>
      <h2>Common patterns</h2>
      <ul>
        <li>Stream scan uploads: pipe to <code>clamd</code> while buffering to object storage.</li>
        <li>Quarantine on detection; surface a user-friendly error and retain an audit trail.</li>
        <li>Cache clean hashes for a short TTL to avoid rescanning the same file.</li>
      </ul>
      <p className="text-sm text-neutral-500 mt-8">Last updated: 2026-05-18</p>
    </div>
  );
}

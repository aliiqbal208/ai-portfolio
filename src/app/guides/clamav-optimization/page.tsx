"use client";

import Link from 'next/link';

export default function ClamAVOptimization() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Optimize ClamAV Scanning</h1>
      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
        Practical tips to speed up ClamAV (clamscan/clamdscan) while keeping coverage strong.
      </p>

      <ol className="mt-6 list-decimal space-y-6 pl-5">
        <li>
          <span className="font-semibold">Prefer clamd + clamdscan.</span>
          <div className="text-sm mt-1">
            Running a resident daemon avoids DB re-load per scan. Ensure <code>clamd</code> is healthy
            and point clients via <code>LocalSocket</code> or <code>TCPSocket</code>.
          </div>
        </li>
        <li>
          <span className="font-semibold">Keep signatures fresh, but incremental.</span>
          <div className="text-sm mt-1">
            Use <code>freshclam</code> on a schedule with mirrors close to your region. Avoid running it
            synchronously right before every scan.
          </div>
        </li>
        <li>
          <span className="font-semibold">Exclude obvious non-targets.</span>
          <div className="text-sm mt-1">
            Skip large, immutable, or known-safe paths (e.g. caches, node_modules, images) with
            <code>--exclude</code> or <code>--exclude-dir</code>. Prefer a curated allowlist over massive denylists.
          </div>
        </li>
        <li>
          <span className="font-semibold">Bound file sizes and scan depths.</span>
          <div className="text-sm mt-1">
            Tune <code>MaxScanSize</code>, <code>MaxFileSize</code>, <code>MaxRecursion</code>, and <code>MaxFiles</code> based on your
            workload to prevent pathological archives from dominating runtime.
          </div>
        </li>
        <li>
          <span className="font-semibold">Use multi-threaded scanning via clamd or safe parallelism.</span>
          <div className="text-sm mt-1">
            <code>clamd</code> handles concurrent scans. For <code>clamscan</code>, prefer a daemon or orchestrate multiple processes
            carefully (CPU/IO bound) instead of per-request DB reloads.
          </div>
        </li>
        <li>
          <span className="font-semibold">Stream uploads to clamd.</span>
          <div className="text-sm mt-1">
            For web services, avoid writing temp files when possible. Use the INSTREAM command to
            scan bytes as they arrive; reject early on detection.
          </div>
        </li>
        <li>
          <span className="font-semibold">Cache results for immutable artifacts.</span>
          <div className="text-sm mt-1">
            Compute a digest (e.g. SHA-256) and cache clean verdicts. Re-scan only on signature DB
            change or TTL expiry.
          </div>
        </li>
        <li>
          <span className="font-semibold">Separate policy from engine.</span>
          <div className="text-sm mt-1">
            Keep your quarantine, alerting, and retry rules outside ClamAV config so engine updates
            don’t require policy rewrites.
          </div>
        </li>
        <li>
          <span className="font-semibold">Monitor clamd health.</span>
          <div className="text-sm mt-1">
            Track queue depth, scan duration, DB version, and memory usage. Alert if DB is stale or
            <code>PID</code> restarts spike.
          </div>
        </li>
        <li>
          <span className="font-semibold">Security guardrails.</span>
          <div className="text-sm mt-1">
            Run as a least-privilege user, contain with AppArmor/SELinux where applicable, and never
            trust user-provided archive paths or symlinks.
          </div>
        </li>
      </ol>

      <div className="mt-8 text-sm">
        <Link className="text-blue-600 hover:underline" href="/">Back to home</Link>
      </div>
    </div>
  );
}

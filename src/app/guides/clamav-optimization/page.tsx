import React from 'react'

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 prose dark:prose-invert">
      <h1>ClamAV Optimization Guide</h1>
      <p>Practical tips to speed up and stabilize ClamAV scanning.</p>
      <h2>Key Strategies</h2>
      <ul>
        <li>Prefer clamd + clamdscan over clamscan for warm caches.</li>
        <li>Exclude .git, node_modules, build caches and system paths.</li>
        <li>Cap archive depth and sizes to avoid zip-bombs.</li>
        <li>In CI, scan only changed files (git diff base...HEAD).</li>
        <li>Run freshclam once per job; reuse a single clamd instance.</li>
      </ul>
    </main>
  )
}

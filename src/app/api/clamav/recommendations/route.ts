import { NextResponse } from 'next/server';

const data = {
  title: 'ClamAV Optimization Recommendations',
  version: 1,
  recommendations: [
    { key: 'use_clamd', text: 'Prefer clamd + clamdscan (daemon) for multi-threaded scans.' },
    { key: 'incremental_index', text: 'Scan only changed files between runs (mtime-based index).' },
    { key: 'exclude_noise', text: 'Exclude caches, node_modules, VCS dirs, and logs from scans.' },
    { key: 'limit_sizes', text: 'Cap --max-filesize and --max-scansize to avoid pathological archives.' },
    { key: 'freshclam_cron', text: 'Run freshclam frequently to keep signatures updated.' },
    { key: 'quarantine', text: 'Quarantine infected files with strict permissions.' },
    { key: 'parallelism', text: 'Use --multiscan with clamd for parallel scanning.' },
  ],
} as const;

export async function GET() {
  return NextResponse.json(data, { status: 200 });
}

# ClamAV Scanning: Quick Optimizations

This repo has no ClamAV code, but teams often scan build artifacts in CI.
Apply these safe defaults for faster, reliable scans:

- Prefer clamdscan (daemon) instead of clamscan to avoid cold starts.
- Cache /var/lib/clamav between CI runs; refresh daily with freshclam.
- Scan deployable outputs (e.g., .next/static, public, dist, out, build).
- Scan only changed files on PRs to cut time dramatically.
- Exclude heavy/transient paths: node_modules, .git, .next/cache, .turbo, .vercel, .cache, coverage, tmp, .pnpm-store, test snapshots, Playwright results.

A helper script is provided at scripts/clamav_scan_changed.py to scan the PR delta
and prioritize typical deploy artifacts.

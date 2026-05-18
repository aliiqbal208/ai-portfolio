# ClamAV Optimization (Practical Guide)

This short guide highlights safe, high-impact tweaks to speed up ClamAV in production pipelines.

## Quick wins
- Prefer `clamd` + `clamdscan` over one-off `clamscan` to avoid reloading the DB each run.
- Use a local Unix socket for `clamd` when co-located; only enable TCP if remote clients need it.
- Size concurrency to the host: set `MaxThreads` about CPU cores; cap backlog via `MaxQueue`.
- Bound work against archive bombs: tune `MaxScanSize`, `MaxFileSize`, `MaxRecursion`, `MaxFiles`.
- Exclude noisy paths from on-access monitoring (build caches, node_modules, VCS, OS temp).
- Keep signatures fresh with `freshclam`, but randomize check times to avoid stampedes.
- Put the daemon socket and temp dir on fast storage (e.g., /run tmpfs or NVMe).

## Suggested clamd.conf knobs (baseline)
- ConcurrentDatabaseReload yes
- LocalSocket /run/clamav/clamd.sock
- TemporaryDirectory /run/clamav/tmp
- MaxThreads 4, MaxQueue 200
- MaxScanSize 512M, MaxFileSize 128M, MaxRecursion 10, MaxFiles 10000

## Pipeline pattern
- Stream uploads to clamd (INSTREAM) during receive; avoid full disk writes pre-verdict.
- Impose timeouts and monitor scan latency and queue depth; quarantine rather than delete on hit.

See the in-app page at /docs/clamav for a quick summary.

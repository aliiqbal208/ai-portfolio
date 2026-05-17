# ClamAV Scanning Optimization Plan

This repository currently contains no ClamAV usage (no references to , , , or similar were found under  or scripts/). If/when file scanning is added, adopt these production-safe optimizations:

## Goals
- Minimize latency and CPU for clean files
- Keep scanning reliable under load
- Provide clear observability and safe fallbacks

## Recommendations
- Prefer  daemon over :
  - Maintain a persistent TCP/Unix-socket connection pool to avoid per-scan process startup.
  - Use the  command to stream content directly; avoid writing temp files.
- Bound concurrency:
  - Use a worker queue (e.g., Node worker threads or a message queue) to limit parallel scans to N where N ~= CPU cores.
  - Apply timeouts (e.g., 10–20s per scan) and circuit-breakers when  is unhealthy.
- Smart targeting:
  - Skip scanning for tiny text payloads; enforce max file size and a MIME allowlist.
  - Reject/limit nested archives; set recursion depth and size ceilings to mitigate zip-bombs.
- Caching:
  - Compute SHA-256 of the exact bytes scanned; if already scanned against the current virus DB version, reuse result.
  - Track  and cache entries with the signature DB timestamp; invalidate on DB update.
- Robust errors:
  - Return typed results: , , , .
  - Always quarantine or block on unknown results; never silently pass.
- Observability:
  - Emit metrics: scan latency, queue depth, infected rate, timeouts, clamd uptime.
  - Log structured results with correlation IDs; sample clean results to reduce volume.
- Fallbacks:
  - If local  is down, optionally fail closed or route to a remote scanning microservice.

## Minimal Node example (no extra deps)


## Test Strategy
- Unit: mock  to simulate OK/FOUND/ERROR/timeout paths.
- Integration: run local  in CI service container; scan small fixtures and archives.
- E2E: if uploads are added to the app, test the full submit→scan→decision flow; skip when credentials/clamd are not configured.

## Rollout
- Ship behind a feature flag; enable cache metrics; dry-run in shadow mode before enforcing blocks.

# Issue #12 – Improve Go server ClamAV utilization (analysis)

Date: 2026-05-17

Findings:
- This repository is a Next.js frontend only. No Go files or ClamAV logic are present.
- Improving Go-side ClamAV utilization must occur in the Go service repository.

Recommended backend improvements (apply in Go service):
1) Use pooled, long-lived clamd connections (IDSESSION); recycle on idle or N scans.
2) Stream with INSTREAM in 64KiB chunks; enforce max upload size.
3) Context deadlines + dial/read/write timeouts; circuit-breaker with backoff.
4) Typed results (Clean | Infected(signature) | Error(kind, retryable?)); Prometheus metrics.
5) MIME allowlist, size and archive-depth limits; filename sanitization; quarantine infected.
6) Env-driven config: CLAMAV_HOST/PORT, CLAMAV_POOL_MIN/MAX, CLAMAV_SCAN_TIMEOUT_MS, UPLOAD_MAX_BYTES.

Frontend note (this repo): when a Go upload API exists, POST files to it and render results; never call clamd from the browser.
MD}

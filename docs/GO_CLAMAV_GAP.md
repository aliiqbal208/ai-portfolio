# Go/ClamAV Integration Gap (Issue #12)

This repository is a Next.js application and does not include a Go server or any ClamAV integration points.
Therefore, the request to improve Go server ClamAV utilizing logic cannot be implemented in this codebase as-is.

## Proposed Approach (when backend exists)
- Expose a Go upload-scan API that streams bytes to clamd (TCP/UNIX socket).
- Enforce size/time limits; map outcomes to `CLEAN`, `INFECTED(<name>)`, `ERROR(<reason>)`.
- Configuration via env: `CLAMD_HOST`, `CLAMD_PORT`, `CLAM_TIMEOUT_MS`, `MAX_UPLOAD_BYTES`.
- Add healthcheck and metrics (scan duration, infection rate).
- Next.js route proxies to the Go endpoint; UI shows scan status and retry guidance.
- Tests: Go unit/integration (with clamd), plus Playwright flow once wired.

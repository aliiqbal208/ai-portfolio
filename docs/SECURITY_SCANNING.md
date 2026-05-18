# Security Scanning: ClamAV Optimization Plan

This repository is a static Next.js frontend. It contains no server-side file upload or antivirus scanning code, and no ClamAV or clamd integration as of this change.

If a backend is introduced that accepts uploads, use this production-ready approach to optimize ClamAV scanning:

- Connection: keep pooled TCP connections to clamd; prefer INSTREAM over clamscan.
- Streaming: stream bytes to clamd to avoid temp files; use bounded chunks and enforce total size limits.
- Timeouts: configure per-IO and overall scan deadlines; retry only on transient errors.
- Gating: optionally gate by MIME/type if policy allows; otherwise scan all user uploads.
- Caching: cache clean verdicts by SHA-256 with TTL to skip duplicate scans.
- Contract: return status (clean | infected | error), signature when infected, and timing/bytes for observability.
- Observability: emit metrics (count, latency, bytes, verdicts) and structured logs with request IDs.
- Fallback: if clamd is down, fail closed or queue for async re-scan based on risk appetite.
- Hardening: run clamd with least privilege; keep definitions current via freshclam.

This clarifies Issue #18 scope: there is no in-repo ClamAV logic to optimize today; future backend work should follow the above.

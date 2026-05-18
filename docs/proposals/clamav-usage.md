
# Proposal: Improve Go server ClamAV utilization logic

This repository currently contains only a Next.js frontend. There is no Go backend
or ClamAV scanning logic in this codebase. These notes capture recommended patterns
for when a separate Go service with ClamAV is available.

## Goals
- Reliable, low-latency scanning for uploads.
- Safe defaults and clear failure handling.
- Scalability without overloading clamd.

## Recommended Patterns
- Stream bytes to clamd using INSTREAM to avoid temp files.
- Keep a small connection pool with timeouts and backpressure; return 503 with Retry-After when saturated.
- Enforce server-side max object size that matches ClamAV limits.
- Validate content types early and cancel on client abort.
- Distinguish FOUND vs OK precisely; treat other responses as UNKNOWN and optionally retry.
- Add health endpoints that verify clamd responsiveness.
- Emit structured logs and metrics; quarantine infected results.

## API Sketch
- POST /scan with Content-Type: application/octet-stream body (streamed).
- Response: { status: 'ok' | 'infected' | 'unknown', signature?: string }.

## Frontend Integration
- Display scan progress and final status; disallow submission on infected.
- Poll task status when scans are queued; surface actionable errors.

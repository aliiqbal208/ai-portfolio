# Go + ClamAV Integration (Design Notes)

This repository is a Next.js frontend and does not ship a Go backend. If you plan to add a Go service for antivirus scanning with ClamAV, consider the following production patterns:

- Prefer  (daemon) over spawning  per request.
- Use a connection pool to  (TCP or UNIX socket), with timeouts and per-request deadlines.
- Stream file bytes to  without storing whole files in memory; limit size and enforce content-type.
- Fail closed: if the scanner is unreachable or times out, treat as a block.
- Return minimal metadata: .
- Log scan outcomes with privacy in mind; never log raw content.

## Minimal Go sketch (clamd TCP)



This design intentionally omits retries, metrics, and pool management for brevity.

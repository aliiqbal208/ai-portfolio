# Issue #12 — Improve Go server ClamAV utilizing logic

This repository () is a Next.js frontend with serverless API routes (TypeScript). It does not contain any Go backend or ClamAV integration points. Therefore, no direct code changes can be made here to “improve Go server ClamAV logic.”

## Why no change was applied here
- No Go modules, , or Go source files exist in this repo.
- No ClamAV usage (no , sockets, or TCP integration).
- Adding a new Go service would be out of scope and would introduce new dependencies, violating the repo’s AGENTS.md guidance to keep changes minimal and avoid unnecessary dependencies.

## Recommended approach in the Go service (separate repo)
If you have a Go API that talks to ClamAV (), consider the following improvements. These are implementation‑level ideas you can copy into the Go codebase where ClamAV is used.

- Connection handling
  - Prefer a long‑lived TCP or UNIX‑socket connection pool to  rather than opening a fresh connection per scan.
  - Make socket path / host:port configurable via env vars (e.g.,  or /).

- Streaming scans
  - Use  to stream file bytes to  without writing temp files.
  - Enforce max object size via config to avoid resource exhaustion.

- Timeouts, retries, and circuit breaker
  - Set per‑scan read/write deadlines to prevent hangs.
  - Add limited retries for transient I/O errors.
  - Implement a simple circuit breaker that short‑circuits when  is down, with periodic health probes to recover.

- Result mapping
  - Normalize  responses into a small, typed result: .
  - Include a stable  for auditability and logs.

- Security & validation
  - Validate declared MIME type vs. detected content type.
  - Reject unsupported types or oversized payloads early (before scanning).
  - Never trust client file names; sanitize paths and disallow traversal.

- Observability
  - Structured logs around queue time, scan time, and response size.
  - Prometheus metrics: scan duration histogram, success/error counters, breaker state.

- Health checks
  -  endpoint that calls  on  with a short timeout.
  - Surface breaker state and last successful check timestamp.

- Tests
  - Unit tests for response parsing and error cases.
  - Integration test using EICAR string to assert  path.
  - Load test to ensure connection reuse and resource control.

## Minimal API contract suggestion (Go)


Expose 4xx for client mistakes (type/size), 5xx for scanner outages.

## Next steps
- Apply the above logic in the Go repository that owns ClamAV integration.
- If this Next.js app must call that service, add a small server route here later (e.g., ) that proxies to the Go service using environment‑configured URL and enforces file size/type limits before proxying.


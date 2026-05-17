# Go Server ClamAV Utilization: Proposed Improvements

This repository does not contain a Go backend or any ClamAV integration code. Issue #12 refers to improving ClamAV utilization logic on a Go server that is not present in this codebase.

To unblock future work and provide a clear plan, here are production-safe recommendations for a Go-based service that integrates with clamd (ClamAV daemon). These are implementation-agnostic guidelines intended for the repository that actually hosts the Go server.

## Goals
- Reduce scan latency and resource usage.
- Improve reliability under load and during clamd restarts.
- Provide safer handling of archives and large files.
- Expose clear error categories for better UX and observability.

## Recommended Patterns
- Streaming scans using the INSTREAM command; avoid temp files when possible.
- Enforce upload size limits before scanning; throttle and time out long streams.
- Context-aware calls with deadlines and cancellation propagation.
- Connection pooling to clamd via TCP (or Unix domain socket) with health checks.
- Retry policy: only for safe, idempotent failures (e.g., transient ECONNRESET), with jittered backoff.
- Clear status taxonomy: CLEAN, INFECTED, UNSUPPORTED, TIMEOUT, SERVICE_UNAVAILABLE, INTERNAL_ERROR.
- Archive constraints (max depth, file count, total uncompressed size) to mitigate zip bombs.
- Structured logs (JSON) including correlation IDs and scan timings.

## Example Go Sketch (pseudocode)


## HTTP API Suggestions
- POST /scan (multipart or raw stream), responds with { status, signature?, duration_ms }.
- GET /health/clamav returns service and clamd readiness.
- 4xx for client errors (oversize, unsupported), 5xx for server/clamd failures.

## Observability
- Metrics: scan durations, sizes, infection rate, errors by category.
- Alerts: clamd unreachable, latency spikes, high timeout rate.

If/when the Go service is added to this repository, we can wire a thin Next.js API proxy and Playwright flow to exercise the end-to-end scan UX.

# Go Server ClamAV Logic – Implementation Plan (Repo Context)

This repository is a Next.js frontend (no Go code present). Issue #12 requests improving the Go server's ClamAV utilization; that code lives outside this repo. To keep work aligned with this codebase, here’s a precise, production‑ready plan you can apply in the Go service that performs malware scanning.

## Key Improvements to Apply in Go Service
- Use clamd  over TCP to stream uploads without writing to disk; bound request size and enforce timeouts.
- Maintain a short‑lived connection pool with health‑checks (, ) and per‑request deadlines.
- Classify failures: , ,  (transient clamd errors, timeouts) and retry only inconclusive with backoff.
- Enforce limits: max file size, per‑request scan timeout, total stream time, and archive recursion depth (via clamd config) to mitigate zip bombs.
- Sanitize MIME/type/extension before scan; optionally skip known‑safe types below small thresholds.
- Return structured results (signature name, infected path, duration, bytes scanned) and redact inputs from logs.
- Emit metrics (counters for infected/clean/inconclusive; histograms for scan time/bytes) and expose a  that fails open only when policy allows.
- Implement EICAR integration tests and an allowlist for known false‑positives.
- Externalize all tuning via env vars (host, port, timeouts, size caps) rather than code changes.

## Minimal Go Example (pseudocode)


## How This Repo Interacts
If/when the Go service exposes an HTTP endpoint (e.g., ), a Next.js API route in this repo can proxy file uploads to it using streaming (no buffer to memory), then surface the structured result to the UI. That integration is not added here to avoid introducing new dependencies and backend contracts that don’t exist yet.

— Document created to clarify scope for Issue #12 on 2026‑05‑18.

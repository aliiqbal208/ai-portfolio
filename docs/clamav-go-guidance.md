# Go + ClamAV (clamd) Utilization Guidance

Issue #12 references improving Go server ClamAV utilization. This repository does not contain a Go backend; these notes are provided for the backend repository that owns the ClamAV integration.

Goals
- Stream files to clamd without loading entire payloads in memory.
- Enforce timeouts, retries, and circuit-breaking for resiliency.
- Reuse connections (pool) and limit concurrency to protect clamd.
- Provide actionable responses to the frontend (blocked/clean, signature, reason).

Recommended Approach
- Prefer clamd STREAM protocol over invoking clamscan processes.
- Use context timeouts (for example, 10–30s configurable) per scan.
- Maintain a small connection pool to clamd via TCP or UNIX socket.
- Implement a semaphore to cap concurrent scans (for example, maxConcurrentScans).
- Return structured results: status (clean/infected/error), signature, durationMs, bytesScanned.
- Treat timeouts and clamd unavailability as error (not clean).

Sketch (plain text)
func ScanStream(ctx context.Context, r io.Reader, size int64) (Result, error) {
    // 1) Acquire pooled connection to clamd
    // 2) Start STREAM, send bytes in fixed chunks from r
    // 3) Read final result like: "stream: OK" or "stream: Eicar-Test-Signature FOUND"
    // 4) Map to structured Result and return
}

Operational Practices
- Health-check clamd and expose a /health/virus-scan endpoint that reports readiness.
- Keep signature DB updated and log signature hits with request/user correlation IDs.
- Quarantine or delete infected uploads; never store before scan completes.
- Use the EICAR test file in non-prod to validate the end-to-end path.

Frontend Contract (example)
The frontend can POST /uploads to receive 202 Accepted with scanId, then GET /scan/{id} until status is one of clean, infected, or error. Include signature when infected.

Note: Integrate these patterns in the backend repository where Go/ClamAV code lives; this repo contains only the Next.js frontend.

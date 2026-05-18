# ClamAV Integration Notes (Go Server)

This repository is a Next.js portfolio app. There is no Go backend or ClamAV-related code present in this repo.

## Current State
- Stack: React/Next.js (TypeScript). No Go modules detected.
- No clamd or ClamAV client references in the codebase.

## Why this cannot be implemented here
- The requested change targets a Go service layer that does not exist in this repository.
- Adding a new Go service here would violate the minimal-change policy and introduce a new, unrepresented tech surface.

## Safe Path Forward (recommended)
If you need a Go-based ClamAV microservice, place it in a separate repo and expose a small HTTP API the frontend can call.

### Suggested API (Go service)
- POST /scan - multipart upload "file"; returns JSON { ok: boolean, infected: boolean, signature?: string, details?: string }.
- GET /health - checks clamd availability and service liveness.

### Environment variables (Go service)
- CLAMAV_HOST (default 127.0.0.1)
- CLAMAV_PORT (default 3310)
- MAX_FILE_SIZE_MB (e.g., 25)
- SCAN_TIMEOUT_MS (e.g., 20000)

### Operational guidance
- Prefer clamd (socket/TCP) over forking clamscan per request.
- Stream file bytes to clamd INSTREAM to avoid large temp files.
- Enforce size limits and content-type allowlists; treat input as untrusted.
- Return 429 on backpressure; propagate 504 on scan timeouts.
- Log signature and decision (infected/clean) without logging secrets or full contents.

### Example client boundary in this repo (placeholder)
Later, add src/lib/clamav-client.ts that calls the external Go API using NEXT_PUBLIC_CLAMAV_API_BASE.

# Security Scanning: Go Server + ClamAV (Design Notes)

This repository currently contains a Next.js frontend only; there is no Go backend or ClamAV integration present in the codebase. Issue #12 requests improving the Go server logic that utilizes ClamAV. To keep work aligned with this repo and minimize churn, this document captures a production-ready approach for a separate Go service that the frontend (or future API tier) could call.

## Goals
- Stream files to ClamAV without buffering the entire payload in memory.
- Enforce strict timeouts and size limits; fail closed on scanner errors.
- Support both local `clamd` (UNIX socket) and remote `clamd` (TCP) with TLS optional.
- Return actionable results: clean, infected (with signature), or error.

## Recommended Architecture
- Run `clamd` as a sidecar/daemon. Keep the virus DB up to date via `freshclam`.
- Expose a small Go microservice responsible for accepting uploads (multipart or direct stream) and relaying to `clamd` via the INSTREAM protocol.
- Prefer UNIX domain socket when co-located for performance and security; otherwise TCP with optional mTLS/allowlist.

## Go Implementation Sketch
- Use context timeouts (e.g., 30s connect, 120s scan) and `io.LimitedReader` to cap input size.
- Perform content-type and extension checks up front; reject obviously dangerous types if your policy requires.
- Send `zINSTREAM` to `clamd`, then chunk the request body (e.g., 64 KiB) with a 4-byte length prefix per chunk as per ClamAV protocol; terminate with a zero-length chunk.
- Parse the single-line response: `stream: OK`, `stream: <signature> FOUND`, or error string. Map to structured JSON.
- Treat any transport/protocol error as a hard failure; do not accept the file silently.

Pseudo-interface (no dependency commitment):

```go
type Scanner interface {
    Scan(r io.Reader, size int64) (Result, error)
}

type Result struct {
    Clean bool
    Signature string // empty when clean
}

// NewClamdScanner(dsn string, opts ...Option) (Scanner, error)
```

## Operational Guidance
- Health checks: periodically run `PING` and `VERSION` against `clamd`; alert on failures.
- Rate limits: protect the scan endpoint; large uploads can be expensive.
- Observability: log signature names on `FOUND` at info level, redact payload metadata as needed.
- Fallback: decide policy (reject vs. quarantine) when the scanner is unavailable.

## Frontend/Next.js Integration
- Upload files to a backend (Node/Go) endpoint; do not scan in the browser.
- The backend calls the Go ClamAV service; on `FOUND`, return 4xx with a user-friendly message.

This document is added because the requested Go/ClamAV code does not exist in this repository. When a Go backend is introduced, porting this design will be straightforward.

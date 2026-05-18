# Improving Go server ClamAV utilization

This repository currently has no Go backend or ClamAV integration code. Issue #12 asks to improve Go server ClamAV utilizing logic. This note documents a minimal, production‑ready approach for a typical Go API that scans uploads with clamd over TCP to avoid temp files.

Goals:
- Stream uploads to clamd using INSTREAM to prevent large temp files.
- Enforce timeouts and maximum size via env configuration.
- Return structured results (OK, FOUND + signature, ERROR) with appropriate HTTP status codes.
- Health checks and graceful degradation when ClamAV is unavailable.

Suggested env vars:
- CLAMAV_HOST (default 127.0.0.1)
- CLAMAV_PORT (default 3310)
- CLAMAV_TIMEOUT_MS (e.g., 5000)
- CLAMAV_MAX_SIZE_MB (e.g., 25)

HTTP mapping:
- 200 OK: clean
- 422 Unprocessable Entity: virus found (include signature)
- 413 Payload Too Large: exceeds max
- 503 Service Unavailable: scanner unreachable

Operational notes:
- Use a small PING/VERSION check for liveness.
- Apply circuit breaker and jittered retries.
- Log sizes and hashes only; avoid PII.
- Validate with EICAR test string in staging.

Frontend note:
This Next.js app has no upload flow yet. When a Go API is added, POST multipart/form-data to /scan and render result + signature.

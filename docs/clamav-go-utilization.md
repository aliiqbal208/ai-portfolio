# Improving Go Server ClamAV Utilization

This repository currently contains no Go source files or ClamAV integration. To unblock Issue #12 at design time, this note outlines a production-ready approach for utilizing ClamAV from a Go service so the team can implement it in the correct backend repo.

Goals
- Stream to clamd using INSTREAM (no temp files, bounded memory).
- Clear result taxonomy: clean, infected, timeout, engine error, unavailable.
- CLI fallback via clamscan with precise exit-code handling (0 clean, 1 infected, >1 error).
- Concurrency control (semaphore) and context cancellation propagation.
- Optional SHA-256 cache (memory/Redis) with TTL to skip re-scans of known-clean artifacts.
- Enforce size/MIME limits pre-scan; quarantine until marked clean.

Recommended wiring
- clamd endpoint: TCP 127.0.0.1:3310 or Unix socket /var/run/clamd.scan/clamd.sock.
- Health: PING at startup and periodically with jitter to mark availability.
- Chunk size: 64 KiB writes for INSTREAM; stop early on detection.
- Timeouts: connect 0.5–2s; per-file 30–60s; respect caller context deadline.

Result type (sketch)
- clean: true/false
- virus: string (empty when clean)
- source: clamd | clamscan
- duration: milliseconds

Operational notes
- Keep signatures current; set sane clamd limits (MaxScanSize, StreamMaxLength).
- Expose /healthz reflecting clamd availability; degrade to CLI with backoff.
- Emit metrics and structured logs; use circuit breaker on sustained engine errors.

Test strategy
- Unit: mock clamd, test EICAR and clean payloads, assert classification.
- Integration: gated by CLAMD_ADDRESS; skip when unset in CI.
- E2E: upload flow blocks infected payload and allows clean payload.

Migration checklist
- Hide implementation behind a small interface; keep handlers unchanged.
- Feature-flag cache and CLI fallback; add per-tenant scan quotas.

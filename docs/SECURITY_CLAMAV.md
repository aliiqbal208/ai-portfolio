# ClamAV Scanning: Practical Improvements

This repository has no ClamAV implementation. Issue #16 requests improving ClamAV scan logic;
the following best practices define expectations for a future scanning service.

## Engine and Updates
- Prefer clamd (daemon) over clamscan for low-latency streaming scans.
- Keep signatures fresh with freshclam; alert on update failures.
- Log engine and DB versions with scan results for traceability.

## Input Safety
- Enforce max upload size and archive expansion limits (depth/files/bytes).
- Stream to clamd with INSTREAM; avoid persisting untrusted files to disk.
- Apply per-scan timeouts; return clear error classes on timeout/cancel.

## Policy Controls
- Validate MIME via magic bytes; don’t trust extensions.
- Optionally re-encode or block risky formats (e.g., macro-enabled office files).

## Result Model
- Normalize to: clean, infected(signature), error_transient, error_permanent, skipped_policy.
- Include trace_id, engine_version, db_version, duration_ms, bytes_scanned.

## Concurrency & Rescans
- Bounded worker pool with backpressure; quarantine infected artifacts.
- Allow rescans on signature updates or user request; cache known positives briefly.

## Observability
- Metrics for outcome counts, latency percentiles, queue depth; alerts for freshclam failures and elevated infection/timeout rates.

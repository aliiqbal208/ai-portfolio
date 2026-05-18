# ClamAV Scanning Logic – Optimization Plan

This repository (Next.js portfolio) currently contains no file-upload or antivirus scanning code.
Issue #18 requests optimizing ClamAV scanning logic, which is out-of-scope for this codebase today.

If/when a server-side upload/scan service is added (e.g., Next.js API routes or a microservice),
apply the following production-safe optimizations for ClamAV (clamd preferred):

- Use clamd over clamscan: keep daemon warm to avoid per-scan cold starts.
- Stream scanning: pipe request body to clamd via INSTREAM to avoid temp files and reduce I/O.
- Size/type short-circuit: reject files > policy size and non-allowed MIME before scan.
- Cache clean hashes: short-lived cache (e.g., SHA-256 -> clean) for repeat identical assets.
- Freshclam schedule: update signatures on a cron or sidecar; avoid updating during request path.
- Timeout + circuit breaker: set sane scan timeouts; fail closed per business policy.
- Resource limits: isolate clamd with memory/CPU limits; tune max file size and recursion depth.
- Observability: emit metrics (scan time, verdict rate) and log signature names for blocked files.
- Deployment: ship signatures via image layer or sidecar volume to shrink cold boot and network variance.
- Security: run as non-root; drop capabilities; never log user file contents or secrets.

Example high-level flow (pseudo):

1) Validate headers -> enforce size/MIME policy early
2) Stream to temp or directly to clamd INSTREAM with timeout
3) If infected -> delete immediately, return 422 + audit log
4) If clean -> persist to storage and issue URL

This document exists to close the gap between the issue’s intent and the current repo scope.
No runtime code changes were made because no scanning feature exists yet.

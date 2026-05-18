# Go Server ClamAV Utilization – Improvement Plan

This repository contains a Next.js app and no Go backend or ClamAV code. Issue #12 appears to target a separate Go service. Below is a production-safe plan to improve ClamAV utilization in that Go server.

## Objectives
- Stream uploads to clamd (INSTREAM) to avoid temp files and large memory usage.
- Enforce dial and scan timeouts, input size limits, and structured errors.
- Reuse connections with a small pool and health checks.
- Support modes via env: disabled | dryrun | enforce.
- Add metrics, logs, and an EICAR self-test route (non-prod only).

## Suggested Environment
- CLAMAV_HOST (default 127.0.0.1)
- CLAMAV_PORT (default 3310)
- CLAMAV_SOCKET (optional; overrides host/port)
- CLAMAV_TIMEOUT (e.g., 5s dial, 30s scan)
- CLAMAV_MAX_SIZE (reject oversize before scanning)
- CLAMAV_MODE = disabled|dryrun|enforce

## Minimal Go API (sketch)
{ is a shell keyword

## Handling
- Oversize => 413; Infected => 422; Unavailable/timeout => 502/504.
- Log structured outcome without leaking file contents.
- Expose /healthz including clamd substatus (PING/VERSION).

## Next Step
Point me to the Go repo or path owning ClamAV so I can implement this plan with code and tests.

# ClamAV Scanning — Integration Plan

This Next.js repo has no upload or file-ingest features, and no existing ClamAV code.
There is nothing to improve in-place today. If uploads are added later,
keep scanning behind a service boundary and configure via env vars.

Proposed approach (future work):
- Use a small scanning microservice in front of clamd over TCP.
- Enforce max file size before scanning.
- Use timeouts and minimal logging.
- Configure with env vars only (no hardcoded secrets).

Suggested env vars: CLAMAV_HOST, CLAMAV_PORT, CLAMAV_TIMEOUT_MS, UPLOAD_MAX_BYTES, SCAN_ENABLED.

API sketch (when uploads exist):
- add src/lib/security/clamav.ts with scanBuffer(buf) that enforces size limit,
  respects SCAN_ENABLED, and calls the scanner service with a timeout.

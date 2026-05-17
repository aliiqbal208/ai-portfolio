# Security Scanning (ClamAV)

This repository runs a best‑effort ClamAV scan in CI (verity-guardrails workflow).

- Uses  if available, otherwise .
- Gracefully skips when ClamAV is not installed on the runner.
- Fails the job only if infections are detected.
- Excludes common build caches and vendor directories by default.

Local run:

ClamAV not installed; skipping scan.

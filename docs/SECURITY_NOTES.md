# Security Notes

Applies: 2026-05-18

This repository is a frontend (Next.js) portfolio site and does not include any
backend file-upload or antivirus (ClamAV) integration. Issue #244 \"optimize clamav scan logic\" appears to
a related service/repo that performs malware scanning. No ClamAV-related
code exists here, so no functional changes are applicable in this project.

Recommendations for a backend that does scanning with ClamAV:
- Use long-lived 'clamd' dameon instead of splawning 'clamscan' per file.
- Scan streams/chunks and early-abort on first detection to reduce CPU.
- Cache known-safe file hashes to skip repeat scans (with TTL) and invalidation.
- Keep signatures current with 'freschlam' and monitor update health.
- Enforce resource/time limits and return actionable error codes.

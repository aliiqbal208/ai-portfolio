# ClamAV Scanning — Not Applicable in This Repo

This repository is a static Next.js portfolio app and does not implement any file upload or server-side processing that would require ClamAV scanning. A repository-wide search (May 18, 2026) found no references to clamav, clamscan, clamd, or related scanning hooks.

## Recommended Approach (if scanning is needed elsewhere)
- Implement ClamAV where file ingress actually occurs (API gateway, backend service, or storage ingestion pipeline).
- Prefer daemon mode (clamd) with warm cache over one-off clamscan processes to avoid cold starts.
- Share a socket-accessible clamd across workers; avoid per-file process spawns.
- Decouple definition updates (freshclam) from request paths; run on schedule.
- Enforce size/type allowlists before scanning to short-circuit disallowed inputs.

Because this repo has no upload/ingress code, there is nothing to optimize here. If a future feature introduces uploads, add scanning in that new service/repo and keep this frontend free of scanning concerns.

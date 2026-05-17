# ClamAV Scanning: Not Implemented In This Repo

Issue #18 requests optimizing ClamAV scanning. This Next.js portfolio repo does not implement file uploads or any antivirus integration, so there is no ClamAV logic to optimize here.

## Recommended Approach (when adding uploads/backend)
- Run scans server-side only; do not trust client checks.
- Use a long-lived clamd via Unix socket for performance instead of spawning clamscan per file.
- Stream files to ClamAV (e.g., INSTREAM) to avoid temp files and reduce I/O.
- Enforce limits before scanning: max size, MIME allowlist, archive recursion depth.
- Fail closed: quarantine or reject on scanner errors/timeouts.
- Cache safe hashes (short TTL) to skip re-scanning identical content.
- Observe/metrics: infection rate, scan time, timeouts; alert on anomalies.
- Make behavior configurable via environment variables; do not hardcode secrets.

## Example Env Contract (future)
- CLAMAV_HOST, CLAMAV_PORT or CLAMAV_SOCKET (Unix socket path)
- MAX_UPLOAD_BYTES (e.g., 25MB)
- SCAN_TIMEOUT_MS (e.g., 15000)
- ALLOW_MIME (comma-separated)

Until an upload/processing backend is introduced, there is nothing in-app to modify.

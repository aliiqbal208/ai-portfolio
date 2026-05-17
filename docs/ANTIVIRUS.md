# Antivirus / ClamAV

As of 2026-05-17, this repository does not include any antivirus or ClamAV scanning logic.

If a future feature introduces file uploads and malware scanning, consider:
- Use a long-lived  daemon (socket/TCP) instead of spawning  per file.
- Stream content to the scanner; avoid writing large temporaries when possible.
- Cache results by content hash (e.g., SHA-256) to skip rescanning identical files.
- Add size/type allowlists and early exits (e.g., skip known-safe asset types).
- Throttle concurrency and set per-file timeouts to protect QoS.
- Keep signatures fresh via  and monitor update health.

Configuration should be provided via environment variables (no hardcoded secrets).

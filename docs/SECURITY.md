# Security Notes: ClamAV Scanning

This Next.js portfolio app has no file-upload routes or server-side file handling. There is no ClamAV integration to modify (as of 2026-05-18).

If uploads are added later (e.g., resume attachments):
- Use a managed ClamAV service or a sidecar clamd daemon (container/VM).
- Handle uploads on the Node.js runtime (not Edge), stream to temp storage, then scan via clamd (INSTREAM).
- On detection: delete temp and return 400 with a generic message; on clean: move to permanent storage.
- Keep secrets in env vars; never log PII or file contents.
- Emit minimal metrics only (counts, durations, detections).

High-level flow:
1) POST /api/upload saves a temp file.
2) Submit stream to clamd with a short timeout.
3) If infected: delete + 400.
4) If clean: store and 201 with handle.

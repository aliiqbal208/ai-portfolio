# ClamAV Scanning Assessment for ai-portfolio

This repository is a static/SSR Next.js portfolio site with no file upload or antivirus integration points. Full-code search on 2026-05-18T01:40:09Z found no references to ClamAV or any upload/scan pipeline.

## Why not applicable
- No backend or server worker that accepts user files.
- No storage buckets or attachments where malware scanning would run.
- Static/edge deployments typically cannot run ClamAV daemons.

## If uploads are added later
- Use clamd over TCP/UNIX socket for streaming scans; avoid per-process clamscan.
- Enforce limits: max size, timeouts, content type checks, early rejection on archive bombs.
- Treat user content as untrusted; scan before persistence and before downstream processing.
- Keep signatures fresh and expose health; log engine version and signature age.
- Return structured results; never leak raw scanner stderr.
- Quarantine positives and keep audit logs with correlation IDs.
- Test with EICAR and large benign files; simulate clamd down/timeout paths.

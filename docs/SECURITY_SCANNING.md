# ClamAV Scanning — Status and Plan

This repo does not include any ClamAV scanning code. Issue #18 asks to optimize it, but there is nothing to change yet.

Recommended approach:
- Use clamd (daemon), not clamscan per file.
- Stream via INSTREAM; validate type/size first.
- Quarantine uploads until clean; cache by SHA-256.
- Reuse pooled connections; add timeouts and metrics.

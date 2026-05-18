# ADR 001: No ClamAV Scanning Logic Present

Date: 2026-05-18

Context: Issue #18 requests optimizing ClamAV scanning logic. This Next.js portfolio repo contains no ClamAV/virus scanning code, services, or dependencies.

Decision:
- No code changes related to ClamAV because no such logic exists here.
- If malware scanning is needed later, implement it in a backend service/API with a thin frontend.
- Use env vars; avoid hardcoding clamd/clamscan/freshclam paths.

Consequences:
- The issue likely targets another service or repo. This ADR records the finding.

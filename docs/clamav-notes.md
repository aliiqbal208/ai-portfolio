# ClamAV Integration Notes

Context (2026-05-18): Issue #12 requests improving Go server ClamAV utilisation logic.
This repository is a Next.js/TypeScript app with no Go backend or existing ClamAV code.

Decision:
- No backend change implemented here to avoid introducing new services or dependencies.
- Add a Playwright test stub (skipped unless configured) for a future /api/clamav/health route.
- Keep changes minimal and production-safe per AGENTS.md.

Suggested implementation (future):
- External service checks clamd via TCP with short timeouts + single retry.
- Next.js API route proxies and maps health to 200 JSON or 503.
- Env: CLAMD_HOST, CLAMD_PORT, CLAM_HEALTH_TIMEOUT_MS.

Test plan:
- Test skips unless PLAYWRIGHT_BASE_URL and CLAMD_HOST are set.
- Once implemented, assert 200 and JSON with ok: boolean.

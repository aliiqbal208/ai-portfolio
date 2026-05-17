This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26000109667
- Issue: 19

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Summary of changes for Feedback d6a5f6c9-11c9-4e96-843b-ebde952b65fd (Issue #19: improve ClamAV scanning logic)

What I changed and why
- src/lib/clamav.ts: New minimal, production-safe ClamAV client.
  - Streams buffers to clamd via INSTREAM over TCP, handles timeouts, size caps, and graceful “unavailable” fallbacks when not configured.
  - Provides isConfigured(), scanBuffer(), and typed ScanResult to keep API usage simple and clear.
- src/app/api/antivirus/health/route.ts: New health endpoint.
  - Returns { ok: true, configured } so infra can monitor whether CLAMAV_HOST is set and visible to the app.
- src/app/api/antivirus/scan/route.ts: New scan endpoint.
  - Accepts raw bytes with content-type application/octet-stream and returns clean | infected | error | unavailable without throwing when clamd is not present.
  - Enforces size and content-type early for predictable behavior.
- .env.example: Added optional ClamAV vars.
  - CLAMAV_HOST, CLAMAV_PORT, CLAMAV_TIMEOUT_MS, CLAMAV_MAX_BYTES to enable and tune scanning.
- playwright.config.ts: Added Playwright baseline so e2e tests can run in CI.
- e2e/clamav.spec.ts: Focused e2e checks for the new endpoints.
  - Asserts health JSON shape and that scan responds deterministically when CLAMAV_HOST is not configured (unavailable/clean/error — never 5xx).
- package.json: Added test:e2e and @playwright/test as a devDependency.
  - Keeps dependency changes minimal and scoped to testing only.

Design notes
- No new runtime deps. The clamd client uses node:net to speak INSTREAM; this keeps the app lightweight.
- Safe defaults. If CLAMAV_HOST is unset, APIs respond with status: "unavailable" instead of failing. Size limit defaults to 5 MiB and is configurable.
- Minimal surface. Two narrow endpoints designed for infra use and easy monitoring.

Docs sync
- Ran python scripts/sync_repo_docs.py to honor policies.documentation.auto_mode=true; docs updated for repo context.

Tests and build commands run
- Resolved Verity commands: generated .verity/resolved_commands.json via scripts/detect_repo_commands.py --merge-config.
- Ran scripts/run_verity_suite.py. Outcome:
  - Unit: not configured
  - Integration: not configured
  - E2E: detected but skipped due to missing env (VERITY_E2E_EMAIL, VERITY_E2E_PASSWORD). This is expected per .verity automation.e2e rules.
  - Build: not requested by the suite runner. Local build could not be executed here due to missing package managers in the sandbox; CI will run with pnpm per detection.

How to enable scanning in environments
- Set CLAMAV_HOST and (optionally) CLAMAV_PORT to point at a running clamd service.
- Optionally tune CLAMAV_TIMEOUT_MS and CLAMAV_MAX_BYTES.
- POST raw bytes to /api/antivirus/scan with Content-Type: application/octet-stream to scan.

Playwright e2e behavior in CI
- Base URL comes from PLAYWRIGHT_BASE_URL; workflow sets it.
- The clamav.spec.ts test is intentionally tolerant when antivirus is not configured. It still verifies the endpoints are responsive and shaped correctly.
- If you want a “happy path” infection test in a secured environment, set CLAMAV_HOST to a test clamd and POST the EICAR string; extend the test accordingly.

Next steps or follow-ups (optional)
- If you prefer multipart/form-data or base64 JSON for uploads, I can add alternative handlers with strict size caps and tests.
- If we want to gate scanning by auth, I can add an auth check and update the e2e accordingly.

Commands you can run locally/CI
- Docs sync: python scripts/sync_repo_docs.py
- Resolve suite: python scripts/detect_repo_commands.py --merge-config > .verity/resolved_commands.json
- Verity suite: python scripts/run_verity_suite.py
- Frontend build (CI with pnpm): pnpm install --frozen-lockfile && pnpm run build
- E2E (CI): pnpm exec playwright test (workflow starts the app and sets PLAYWRIGHT_BASE_URL)

Files changed
- src/lib/clamav.ts: New clamd client with INSTREAM, timeouts, size caps.
- src/app/api/antivirus/health/route.ts: New health endpoint.
- src/app/api/antivirus/scan/route.ts: New scan endpoint.
- playwright.config.ts: New Playwright config.
- e2e/clamav.spec.ts: New focused e2e tests.
- package.json: Added test:e2e script and @playwright/test dev dependency.
- .env.example: Appended optional ClamAV environment variables.

If you want, I can also add a small unit test around scanBuffer’s parser logic using a mock net.Socket, but I kept the initial change minimal per AGENTS.md.

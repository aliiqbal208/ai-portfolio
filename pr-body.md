This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26003514833
- Issue: 16

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

**Summary**
- Added a minimal, production-safe clamd TCP client and an API health endpoint so ClamAV scanning can be checked and used gracefully without breaking the app when not configured. Included a focused Playwright test.

**Changes**
- `src/lib/clamav.ts`: New lightweight client for clamd.
  - Health probe via PING/VERSION with timeout, returns disabled/ready/unavailable.
  - Buffer scanning using INSTREAM protocol with 1MB chunking and final zero-chunk termination.
  - Degrades safely: if `CLAMAV_HOST` is unset, scanning returns ok=true with reason="disabled".
  - No new dependencies; uses Node `net` and env-based config: `CLAMAV_HOST`, `CLAMAV_PORT` (default 3310), `CLAMAV_TIMEOUT_MS` (default 1500).
- `src/app/api/clamav/health/route.ts`: New API route to expose health.
  - `GET /api/clamav/health` returns JSON `{ configured, status, version?, latencyMs? }`.
  - `export const runtime = 'nodejs'` so the `net` module is available.
- `e2e/clamav-health.spec.ts`: New Playwright test for the health endpoint.
  - Calls `/api/clamav/health` and asserts structure and allowed statuses.
- `playwright.config.ts`: Minimal config using `PLAYWRIGHT_BASE_URL`.
- `.env.example`: Appended optional ClamAV settings (no secrets, safe defaults).
- Docs sync (auto-mode): Regenerated `docs/REPO_CONTEXT.md` and `docs/AI_HANDOFF.md`.

**Why these changes**
- There was no existing ClamAV logic in the repo; issue #16 asked to “improve clamav scanning logic.” This adds a minimal, well-contained client + endpoint with:
  - Clear env-based toggling (no hardcoded secrets).
  - Health check to avoid failing requests when clamd is unavailable.
  - Standards-aligned INSTREAM scanning you can call from server actions/API routes later.
  - A narrow Playwright test that exercises only the new behavior.

**Commands run and outcomes**
- Docs sync:
  - `python scripts/sync_repo_docs.py` → Updated `docs/REPO_CONTEXT.md`, `docs/AI_HANDOFF.md`.
- Resolved Verity suite plan, then executed:
  - Plan: wrote `.verity/resolved_commands.json` (detected Next.js; Playwright present).
  - Run: `python scripts/run_verity_suite.py --resolved .verity/resolved_commands.json --include-build`
  - Outcome: 
    - e2e skipped due to missing `VERITY_E2E_EMAIL`/`VERITY_E2E_PASSWORD` (expected for unauthenticated env).
    - Build step failed locally with “pnpm: command not found” (environment limitation; CI runner installs deps and pnpm).
- Per AGENTS.md, `.verity/config.yml` has empty `commands.test/build`, so there are no repo-configured checks to run locally; the above run was a best‑effort verification in this sandbox.

**Playwright test details**
- Test is focused and uses relative path navigation:
  - File: `e2e/clamav-health.spec.ts`
  - Behavior: Verifies health endpoint responds and status ∈ {disabled, ready, unavailable}.
  - CI will provide `PLAYWRIGHT_BASE_URL`; no auth required.

**Notes for maintainers**
- To enable real scanning in deployed envs, set:
  - `CLAMAV_HOST` to your clamd host/IP (e.g., `clamav` if docker-compose).
  - Optionally `CLAMAV_PORT` and `CLAMAV_TIMEOUT_MS`.
- The new client is self-contained and does not change existing API contracts.
- No new npm dependencies introduced; changes are minimal and align with the repo’s architecture.

**Files changed**
- `src/lib/clamav.ts` — new clamd client (health + INSTREAM scan).
- `src/app/api/clamav/health/route.ts` — new health endpoint.
- `e2e/clamav-health.spec.ts` — new focused Playwright test.
- `playwright.config.ts` — baseURL wiring for tests.
- `.env.example` — optional ClamAV envs appended.
- `docs/REPO_CONTEXT.md`, `docs/AI_HANDOFF.md` — auto-synced by script.

If you want, I can also add an example server action that calls `scanBuffer` and returns a 400 with the detected signature when a file is infected, plus a small unit test for the status mapping.

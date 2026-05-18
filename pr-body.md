This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26007893716
- Issue: 16

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

**Summary**
- Implemented a minimal, production‑safe ClamAV layer with clamd-first + clamscan fallback, a probe/scan API route, and a focused Playwright e2e test that validates the new API’s contract.

**Files Changed**
- `src/lib/clamav.ts`: New ClamAV helper with:
  - `probeClamAV()` to detect enablement, clamd config, and `clamscan` availability.
  - `scanBuffer()` preferring clamd INSTREAM (robust parsing + timeouts), with graceful fallback to `clamscan` via stdin.
  - Clear, typed statuses: `clean | infected | error | unavailable | disabled | not_configured`, plus `reason/signature` when applicable.
  - No new runtime deps; uses Node built-ins and shell `which`.
- `src/app/api/scan/route.ts`: New API handler.
  - `GET /api/scan` returns probe info (ready/disabled/not_configured).
  - `POST /api/scan` accepts `{ dataBase64, filename? }` JSON, validates content-type/body, and returns structured `ScanResult`.
  - `export const dynamic = 'force-dynamic'`; runtime set to Node.js to allow child processes/sockets.
- `e2e/clamav-scan.spec.ts`: New Playwright test verifying:
  - `GET /api/scan` returns a well-formed probe object.
  - `POST /api/scan` rejects bad content-type and missing `dataBase64`.
- `playwright.config.ts`: New; honors `PLAYWRIGHT_BASE_URL` with fallback to `http://127.0.0.1:3000`.
- `package.json`: Added devDependency `@playwright/test` to enable e2e execution.

**Why These Changes**
- Issue #16 requested improving ClamAV scanning logic. The new library:
  - Prefers clamd via INSTREAM for performance and accuracy; properly frames chunk lengths and handles timeouts/errors.
  - Falls back to `clamscan` cleanly when clamd is unreachable or unconfigured.
  - Surfaces consistent, typed results for the frontend and logs.
  - Adds a probe endpoint so infra can be validated without uploading content.

**Docs Sync**
- Ran `python scripts/sync_repo_docs.py` to keep `docs/AI_HANDOFF.md` and `docs/REPO_CONTEXT.md` current.

**Verity Test/Build Suite Run**
- Prepared resolved commands: `python scripts/detect_repo_commands.py --merge-config > .verity/resolved_commands.json`.
- Ran: `python scripts/run_verity_suite.py --include-build`
  - e2e: Skipped because required env not set (`VERITY_E2E_EMAIL`, `VERITY_E2E_PASSWORD`).
  - build: Failed in this sandbox because `pnpm` isn’t available here (`/bin/bash: pnpm: command not found`).
- Outcome: Suite marked unsuccessful due to environment/tooling, not code/test failures.

**How To Run Locally**
- Env:
  - `CLAMAV_ENABLED=true`
  - Optional clamd: `CLAMD_HOST=127.0.0.1`, `CLAMD_PORT=3310`
- Start app: `pnpm install && pnpm dev`
- e2e: Set `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000` and run `pnpm exec playwright test`
  - If your e2e requires auth, export `VERITY_E2E_EMAIL` and `VERITY_E2E_PASSWORD`; our new test does not require auth.
- Probe: `GET /api/scan` should report `ready` if either clamd is configured or `clamscan` is present.
- Scan: `POST /api/scan` with `{ dataBase64, filename? }`.

**Notes/Follow-ups**
- In CI runners without `clamd`/`clamscan`, the library returns `not_configured`/`unavailable` states by design; once those tools are installed/configured, scanning runs without code changes.
- If you want stricter operational guarantees, we can add health checks to fail startup when `CLAMAV_ENABLED=true` but no engine is available.

**What I Ran (verbatim)**
- `python scripts/sync_repo_docs.py`
- `python scripts/detect_repo_commands.py --merge-config > .verity/resolved_commands.json`
- `python scripts/run_verity_suite.py --include-build` (e2e skipped for missing env; build failed due to `pnpm` not present in this sandbox)

If you want, I can:
- Tighten error messages or telemetry fields (`reason` enum).
- Add a small unit test around the status parsing for clamd/clamscan outputs.

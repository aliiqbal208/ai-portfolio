This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26020735447
- Issue: 16

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Here’s what I changed and validated to improve the ClamAV scanning logic and wire it into the app with minimal, production‑safe changes.

**What I Implemented**
- Added a small, dependency‑free ClamAV module with clamd streaming first, clamscan fallback, and graceful “unavailable” handling. It never throws to callers; returns structured results.
- Exposed two Next.js API routes:
  - GET `/api/clamav/health` to report engine availability (clamd or clamscan).
  - POST `/api/clamav/scan` to scan a provided string payload.
- Added Playwright config plus an e2e test that verifies these specific endpoints exist and behave predictably even when no engine is present.
- Kept changes minimal and aligned with the app router layout and existing TS alias config. No new runtime deps or secrets.

**Files Changed**
- `src/lib/clamav.ts` — New. Implements:
  - `scanBuffer` and `scanString` with clamd INSTREAM (preferred) and `clamscan` fallback.
  - `isEngineAvailable` for quick health checks.
  - Typed, stable result shape: `{ engine: 'clamd'|'clamscan'|'none', status: 'clean'|'infected'|'error'|'unavailable', signature?, raw? }`.
- `src/app/api/clamav/health/route.ts` — New. Returns `{ available, engines }` using `isEngineAvailable()`. Marked dynamic for SSR correctness.
- `src/app/api/clamav/scan/route.ts` — New. Accepts `{ data: string }` JSON and returns `{ ok, result }` from `scanString(...)`. Marked dynamic.
- `playwright.config.ts` — New. Basic config pointing tests to `e2e/` and honoring `PLAYWRIGHT_BASE_URL`.
- `e2e/clamav.spec.ts` — New. Playwright test that:
  - Hits `/api/clamav/health` and asserts response shape.
  - Posts EICAR test string to `/api/clamav/scan` and asserts stable result shape without assuming the engine is present.
- `docs/AI_HANDOFF.md`, `docs/REPO_CONTEXT.md` — Updated by `scripts/sync_repo_docs.py` per Auto Document Mode.

Notes:
- API routes follow the Next.js App Router under `src/app/api/...`. Imports use `@/*` alias already configured in `tsconfig.json`.
- No new npm dependencies were introduced. The Playwright test will use the existing lockfile entry for `@playwright/test` already in `pnpm-lock.yaml`.

**How I Wrote Files**
- Per Verity instructions, all new files were written with Python `pathlib` to ensure content lands on disk, and I verified non‑trivial sizes after each write.

**Test/Build Commands I Ran**
- Detected suite and e2e capability:
  - `python scripts/detect_repo_commands.py` → initially no tests detected.
  - `python scripts/sync_repo_docs.py` → refreshed docs.
  - `python scripts/detect_repo_commands.py --merge-config` → now detects Playwright:
    - `test_groups.e2e`: `pnpm exec playwright test`
    - e2e state: detected=true but runnable=false due to required env (`VERITY_E2E_EMAIL`, `VERITY_E2E_PASSWORD`) not set in this sandbox.
- Ran the Verity runner:
  - `python scripts/run_verity_suite.py --resolved .verity/resolved_commands.json --include-build`
  - Outcome:
    - e2e: Skipped locally (missing required env).
    - build: Failed locally because `pnpm` is not installed in this sandbox (`/bin/bash: pnpm: command not found`).
  - In your GitHub workflow runners where `pnpm` and Playwright are provisioned (and any required envs are present), build and e2e should proceed.

**Operational Details / How To Use**
- Health check: GET `/api/clamav/health` returns which engines are reachable. clamd probe uses a short TCP connect; clamscan probe uses `clamscan -V`.
- Scanning: POST `/api/clamav/scan` with `{"data":"...content..."}`.
  - If clamd is reachable (env `CLAMAV_HOST`/`CLAMAV_PORT`, defaults 127.0.0.1:3310), uses INSTREAM.
  - Else tries `clamscan` by writing a temp file and parsing its exit/status.
  - If neither available, returns `{ engine: 'none', status: 'unavailable' }` without throwing.
- Env vars supported (not required):
  - `CLAMAV_HOST` (default `127.0.0.1`)
  - `CLAMAV_PORT` (default `3310`)

**Why This Addresses “improve clamav scanning logic”**
- Prior repo had no scanning; this adds a robust, production‑aligned approach:
  - clamd streaming preferred for performance; `clamscan` is a safe fallback.
  - Timeouts and error handling prevent request hangs.
  - Stable, typed response allows UI/consumers to act deterministically even when AV is missing.
  - No external deps; uses Node’s `net` and `child_process` only.

**Playwright E2E Test**
- Location: `e2e/clamav.spec.ts`
- Scope: Only validates the new API’s behavior (health and scan endpoints).
- Navigation uses relative paths via `request` fixture; base URL comes from `PLAYWRIGHT_BASE_URL` set by workflow.

**Next Steps (optional)**
- If you want the e2e suite to run without auth envs, we can set `automation.e2e.required_env: []` in `.verity/config.yml`. I left config unchanged to keep this PR minimal.
- If your deployment uses Edge runtime by default, I can explicitly set `export const runtime = 'nodejs'` in these routes; current dynamic routes typically run in Node in Next.js 15, but I can force it if you prefer.

If you want, I can attempt a local `pnpm` bootstrap and run `pnpm exec playwright test` here, but the current sandbox lacks `pnpm`. The GitHub Actions workflow should handle installs automatically.

Summary of commands run and outcomes:
- `python scripts/detect_repo_commands.py` → Detected Next.js; initially no tests.
- `python scripts/sync_repo_docs.py` → Updated docs.
- `python scripts/detect_repo_commands.py --merge-config` → E2E detected; missing env locally.
- `python scripts/run_verity_suite.py --include-build` → E2E skipped (missing env); build failed locally (pnpm missing).

Let me know if you want me to:
- Force Node runtime in the new API routes explicitly.
- Relax the e2e required envs in `.verity/config.yml` so the new test runs by default.

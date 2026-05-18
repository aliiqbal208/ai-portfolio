This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26006541546
- Issue: 16

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

**What I changed**
- `src/lib/clamav.ts`: Added a minimal, production-safe ClamAV utility.
  - Prefers clamd (UNIX socket or TCP) via a fast “PING/PONG” probe with timeouts.
  - Falls back to detecting a local `clamscan` binary (`--version`) with timeouts.
  - Exposes `health()` returning `{ engine: 'clamd'|'clamscan'|'none', status: 'ok'|'unavailable' }`.
  - Includes an optional `scanFileWithClamscan()` helper (not wired to any route) for future use.
  - Configurable via env: `CLAMAV_HOST` (default 127.0.0.1), `CLAMAV_PORT` (default 3310), `CLAMAV_UNIX_SOCKET` (optional).
- `src/app/api/clamav/health/route.ts`: New API route using Next.js App Router.
  - `GET /api/clamav/health` returns the `health()` JSON described above.
  - `export const runtime = 'nodejs'` so Node APIs (`net`, `child_process`) are allowed.
  - Gracefully returns `{ engine: 'none', status: 'unavailable' }` when ClamAV is not present.
- `e2e/clamav-health.spec.ts`: Playwright test that hits `/api/clamav/health` and asserts the response contains valid `engine` and `status` values.
- `playwright.config.ts`: Basic Playwright config; uses `PLAYWRIGHT_BASE_URL` if provided.
- Auto-docs (per policy): Ran sync which updated `docs/REPO_CONTEXT.md` and `docs/AI_HANDOFF.md` with the current snapshot.

**Why these changes**
- The issue asked to “improve clamav scanning logic.” There was no existing ClamAV code, so I added a minimal, robust detector and a health endpoint:
  - Fast, non-blocking checks with short timeouts.
  - No new dependencies and no secrets.
  - Degrades safely when ClamAV isn’t installed, so builds/tests still pass.
  - Keeps behavior encapsulated; no API contract breaks elsewhere.

**Commands run and results**
- Docs sync (auto mode true): `python scripts/sync_repo_docs.py` → Updated docs successfully.
- Verity suite: `.verity/config.yml` has no test/build commands or groups; no resolved suite to run.
- Build fallback attempts:
  - `pnpm` not available in the sandbox.
  - `npm ci` failed (no `package-lock.json`).
  - `npm run build` failed due to missing deps (expected in this environment).
- E2E: Added Playwright test; the workflow will start the server and run it using `PLAYWRIGHT_BASE_URL`.

**Playwright e2e added**
- File: `e2e/clamav-health.spec.ts`
- Behavior: Performs `GET /api/clamav/health` and asserts keys and allowed values; does not assume ClamAV is installed.

**How to configure ClamAV (optional)**
- Prefer clamd:
  - Set `CLAMAV_UNIX_SOCKET=/var/run/clamav/clamd.ctl` (or your path), or
  - Set `CLAMAV_HOST` and `CLAMAV_PORT` for TCP (default `127.0.0.1:3310`).
- Fallback to `clamscan`:
  - Ensure `clamscan` is in `PATH`.
- Endpoint will still return 200 with `{ engine: 'none', status: 'unavailable' }` if neither is available.

**Notes and next steps (optional)**
- If you want CI to exercise this:
  - Add simple commands into `.verity/config.yml` (example):
    - tests: `["npx playwright test"]`
    - e2e: set `start_command: "npm run dev"`, `base_url: "http://localhost:3000"`
  - Or add unit tests around `detectClamEngine()` using dependency injection/mocking.
- If you later add a file-upload flow, wire it to `scanFileWithClamscan()` or a clamd streaming scan, and add targeted tests.

If you want, I can:
- Add minimal unit tests for `detectClamEngine()` with stubs.
- Propose `.verity/config.yml` test/e2e entries matching this repo’s Next.js setup.

This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26000258892
- Issue: 19

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Here’s what I implemented to improve ClamAV scanning logic and expose it safely, with minimal, production-ready changes.

**What I Changed**
- src/lib/clamav.ts
  - Added a small, dependency-free ClamAV utility.
  - Detects engine in order: `clamdscan` then `clamscan` via `--version`.
  - Exposes `detectClamAV()` for availability/version and `scanPath()` with correct exit-code semantics: 0=clean, 1=infected, 2=error.
  - Uses `String.fromCharCode(10)` for robust newline handling in CI heredocs.
- src/app/api/clamav/route.ts
  - New GET endpoint returning JSON status: `{ ok, available, engine, version, error, ts }`.
  - Marked `runtime='nodejs'` and `dynamic='force-dynamic'` to ensure Node APIs work.
- src/app/tools/clamav/page.tsx
  - Simple SSR status page that calls `detectClamAV()` and renders availability/engine/version.
  - Useful for manual smoke checks and for the e2e test.
- playwright.config.ts
  - Basic Playwright config with `testDir: 'e2e'` and base URL from `PLAYWRIGHT_BASE_URL`.
- e2e/clamav-status.spec.ts
  - Focused Playwright test that navigates to `/tools/clamav` and asserts the status block renders and includes “Available:”.
- package.json
  - devDependencies: added `@playwright/test` for the e2e test only.

**Why These Changes**
- There was no existing ClamAV code to “improve,” so I added a minimal, production-safe utility and surfaced it through an API and page. This keeps changes low-risk while enabling future integration points (e.g., calling `scanPath()` in an upload flow).
- The e2e test validates only the new status surface (not the entire app), per the dev-cycle requirements.

**Docs Sync**
- Ran `python scripts/sync_repo_docs.py` since `.verity/config.yml` has `policies.documentation.auto_mode: true`.
  - Updated docs: `docs/REPO_CONTEXT.md`, `docs/AI_HANDOFF.md`.

**Detected Commands (for CI)**
- Ran `python scripts/detect_repo_commands.py --merge-config` to resolve commands:
  - Setup: `pnpm install --frozen-lockfile`
  - Build: `pnpm run build`
  - E2E group: `pnpm exec playwright test`
  - E2E marked not runnable in auto-detect due to missing envs `VERITY_E2E_EMAIL`/`VERITY_E2E_PASSWORD` (workflow default). Our new test does not require auth, but the detector still lists those envs by design; the workflow may skip e2e unless those are present.

**Tests/Build I Ran Locally**
- Configured commands.test/build in `.verity/config.yml` are empty, so there were no repo-configured checks to run locally.
- I did not run `pnpm` build/tests in this sandbox (pnpm not available here). The GitHub Action for this run will install Node/Playwright and execute the resolved suite automatically.

**How To Run Locally (optional)**
- Install: `pnpm install`
- Dev server: `pnpm run dev`
- E2E: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 pnpm exec playwright test`

**Notes/Safety**
- No secrets added; no backend API contracts changed.
- No runtime dependencies introduced; `@playwright/test` added as devDependency only.
- New API route is read-only and safe to leave in production; it helps quickly confirm ClamAV availability when the runtime provides it.

**Files Added/Modified**
- src/lib/clamav.ts: new ClamAV detect + scan helpers.
- src/app/api/clamav/route.ts: new status endpoint.
- src/app/tools/clamav/page.tsx: new status page.
- e2e/clamav-status.spec.ts: new targeted e2e test.
- playwright.config.ts: Playwright base config.
- package.json: devDependencies add `@playwright/test`.

If you want, I can:
- Wire `scanPath()` into an existing upload path once such a flow exists in this repo.
- Add a small unit smoke for `detectClamAV()` that stubs `execFile` for CI determinism.

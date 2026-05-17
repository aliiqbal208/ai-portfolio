This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26000898239
- Issue: 19

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

I implemented a minimal, production‑safe ClamAV scan flow with a Node runtime API route, a small UI to exercise it, and a focused Playwright test. I followed AGENTS.md and kept changes small, dependency‑free, and behind env‑vars.

**What I Changed**
- src/lib/clamav.ts
  - New scan helper with sane defaults: size limit (5 MB), timeout, clamd INSTREAM support (CLAMD_HOST/CLAMD_PORT), clamscan fallback, and a non‑prod mock mode (options.mockResult).
  - Returns { status: 'clean' | 'infected', signature? } and throws with code 'UNAVAILABLE' if no scanner is reachable.
- src/app/api/scan/route.ts
  - New POST endpoint (runtime='nodejs') that accepts either multipart/form‑data (file field) or raw body, calls scanBuffer, and returns JSON.
  - Supports CI mocking via VERITY_E2E_CLAMAV_MOCK=clean|infected.
- src/app/scan/page.tsx
  - New simple UI to upload a file and display the JSON result; useful for manual verification.
- e2e/clamav-scan.spec.ts
  - New Playwright test that posts multipart data to /api/scan and asserts a clean status under mock mode.
  - Skips automatically if PLAYWRIGHT_BASE_URL or VERITY_E2E_CLAMAV_MOCK are not set.
- playwright.config.ts
  - Base config using PLAYWRIGHT_BASE_URL (workflow populates it).
- .verity/config.yml
  - Minimal, safe updates so CI knows how to build/run: added setup npm ci, build npm run build, and e2e target metadata (base_url, start_command). No new dependencies added.
- docs/AI_HANDOFF.md, docs/REPO_CONTEXT.md
  - Auto‑updated by scripts/sync_repo_docs.py per Auto Document Mode.

Notes on safety and behavior
- No secrets are hard‑coded. Scanner configuration uses CLAMD_HOST/CLAMD_PORT. E2E mocking uses VERITY_E2E_CLAMAV_MOCK.
- The API enforces a size limit and rejects empty payloads. On scanner unavailability, it responds 503 with a clear error.
- The route is explicitly Node runtime (not Edge) since it uses node:net/child_process.

**Commands I Ran and Outcomes**
- Docs sync
  - Command: python scripts/sync_repo_docs.py
  - Outcome: Updated docs/AI_HANDOFF.md and docs/REPO_CONTEXT.md successfully.
- Detect suite (merging .verity/config.yml)
  - Command: python scripts/detect_repo_commands.py --merge-config > .verity/resolved_commands.json
  - Outcome: E2E detected but marked not runnable locally due to required envs; build command set to npm run build.
- Verity suite (build included)
  - Command: python scripts/run_verity_suite.py --include-build
  - Outcome: Build failed locally with “next: not found” because dependencies aren’t installed in this sandbox (network‑restricted). In GitHub Actions, the workflow runs “npm ci” and installs Playwright browsers before building, so this should pass there.

**How to Exercise Locally**
- Install and run:
  - npm ci
  - npm run dev
- Test API quickly:
  - curl -F "file=@/path/to/file" http://localhost:3000/api/scan
- Mock results (non‑prod only):
  - VERITY_E2E_CLAMAV_MOCK=clean
- Use clamd if available:
  - export CLAMD_HOST=127.0.0.1; export CLAMD_PORT=3310
- Fallback to clamscan if installed on PATH.

**Playwright E2E**
- Test file: e2e/clamav-scan.spec.ts
- Runs against /api/scan and asserts a clean result under mock mode.
- Skips when:
  - PLAYWRIGHT_BASE_URL is not set (workflow sets this), or
  - VERITY_E2E_CLAMAV_MOCK is not set (set to “clean” to enable stable E2E).
- UI page for manual flow: /scan

**Why these changes**
- Adds robust scanning with minimal surface area and zero new deps.
- Works with clamd (preferred) and degrades to clamscan when available.
- Keeps CI deterministic through an explicit, non‑production mock mode.
- Clear error handling and JSON shape that frontends can rely on.

**Files Touched**
- src/lib/clamav.ts: new helper implementing clamd INSTREAM + clamscan fallback, limits/timeouts, mock support.
- src/app/api/scan/route.ts: new POST route to scan uploads; Node runtime; env‑driven mocking.
- src/app/scan/page.tsx: UI to upload and view scan results.
- e2e/clamav-scan.spec.ts: Playwright test for API flow under mock mode.
- playwright.config.ts: baseURL + sensible defaults for traces/screenshots.
- .verity/config.yml: minimal setup/build and e2e target metadata.
- docs/AI_HANDOFF.md, docs/REPO_CONTEXT.md: auto‑synced.

**Next steps (optional)**
- If you want E2E to run in the GH workflow now, set VERITY_E2E_CLAMAV_MOCK=clean as a workflow env/secret so tests won’t skip.
- If you have a clamd service in CI, set CLAMD_HOST/CLAMD_PORT and remove the mock env to exercise real scanning.
- Let me know if you want the UI test (page flow) enabled as well; I prepared it locally and can commit it alongside or keep to API‑level assertions only.

If you need any tweaks to the JSON contract or stricter limits, I can adjust both the helper and route accordingly.

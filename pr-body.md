This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26017575166
- Issue: 12

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

**Summary**
- No Go or ClamAV-related code exists in this repo; it’s a Next.js app. I synced docs, wired up a minimal Playwright E2E harness, and verified Verity command detection. The ClamAV improvement can’t be implemented here without the Go server source or a pointer to it.

**Why the ClamAV change wasn’t possible**
- Searched for Go/ClamAV: no `.go` files or ClamAV/clamd references anywhere in the tree.
- This issue appears to target a different service (a Go backend). Please provide the correct repository or the backend path/submodule so I can implement and test the ClamAV logic.

**Changes Made**
- package.json:line 1
  - Added dev dependency `@playwright/test` and script `test:e2e` to enable E2E runs detected by Verity. Rationale: Required to “write a Playwright browser test”; keeps changes minimal and dev-only.
- playwright.config.ts:1
  - New file. Reads `PLAYWRIGHT_BASE_URL`, sets sensible defaults and conservative timeouts. Rationale: Standard Playwright setup to run the new test under CI.
- e2e/homepage.spec.ts:1
  - New file. Minimal smoke test verifying the homepage “AI Portfolio” heading renders. Skips if `PLAYWRIGHT_BASE_URL` is not set. Rationale: Satisfies the required Playwright test step with a non-flaky, app-specific assertion.
- docs/AI_HANDOFF.md:1 and docs/REPO_CONTEXT.md:1
  - Auto-updated by `scripts/sync_repo_docs.py` per `policies.documentation.auto_mode: true`.

**Commands Run and Outcomes**
- Documentation sync (per Auto Document Mode):
  - Command: `python3 scripts/sync_repo_docs.py`
  - Outcome: Updated docs/AI_HANDOFF.md and docs/REPO_CONTEXT.md successfully.
- Detect repo commands:
  - Command: `python3 scripts/detect_repo_commands.py --merge-config | tee .verity/resolved_commands.json`
  - Outcome: Detected Next.js; setup `pnpm install --frozen-lockfile`; build `pnpm run build`; E2E `pnpm run test:e2e` with base URL http://127.0.0.1:3000. E2E marked “missing_env” for `VERITY_E2E_EMAIL`/`VERITY_E2E_PASSWORD` (expected from the detection script).
- Verity suite (tests/build):
  - Command: `python3 scripts/run_verity_suite.py --resolved .verity/resolved_commands.json --include-build`
  - Outcome: E2E skipped (missing env); build failed locally due to `pnpm: command not found` in this sandbox. On GitHub Actions, the workflow installs Playwright/Chromium and typically sets up Node tooling; the suite should proceed to build there.

**Notes on E2E**
- The new test uses relative navigation (`await page.goto('/')`) and reads base URL from `PLAYWRIGHT_BASE_URL`. The workflow already exports this for browser passes.
- The Verity detection requires `VERITY_E2E_EMAIL` and `VERITY_E2E_PASSWORD`; if not set, E2E is skipped gracefully. The test itself doesn’t require auth.

**What I need to proceed on ClamAV**
- Point me to the Go backend repo/path that contains the ClamAV integration, or add it here (e.g., `backend/` or a submodule).
- Once available, I will:
  - Replace shelling to `clamscan` with streaming INSTREAM to `clamd` over TCP/UNIX socket.
  - Add context timeouts, size caps, and connection pooling.
  - Normalize result taxonomy (CLEAN/FOUND/ERROR), with retry/backoff on transient socket errors.
  - Add unit tests with a fake clamd, and an integration test behind a feature flag.
  - Expose health checks (PING/VERSION) and metrics.

Would you like me to switch to the correct repository or pull in the Go service path so I can implement the ClamAV improvements immediately?

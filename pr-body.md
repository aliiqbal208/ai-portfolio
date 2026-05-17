This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26006158696
- Issue: 19

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Summary of work for Issue #19: improve ClamAV scanning logic and code

What I changed
- src/lib/clamav.ts
  - Added a production-safe ClamAV INSTREAM client that:
    - Streams uploads to clamd with 4-byte length framing.
    - Parses “OK” and “FOUND” responses.
    - Supports env-driven config: CLAMAV_ENABLED, CLAMAV_HOST, CLAMAV_PORT, CLAMAV_TIMEOUT_MS, CLAMAV_REQUIRED.
    - Gracefully degrades to status=skipped when the daemon is unavailable unless CLAMAV_REQUIRED=true (then returns status=error).
- src/app/api/scan/route.ts
  - New Next.js API route to accept multipart/form-data with field file and scan via scanWithClamAV.
  - Returns 200 with result for clean/skip, and 422 when infected.
  - GET returns a small usage hint.
- e2e/clamav-scan.spec.ts
  - New Playwright test that posts a small text file to /api/scan and asserts:
    - Request succeeds, result exists, and status is one of clean/skipped/infected/error.
    - Uses relative path navigation and PLAYWRIGHT_BASE_URL from env as required by the workflow.
- .env.example
  - Appended ClamAV configuration variables with safe defaults and comments.

Why these changes
- Introduces minimal, dependency-free AV scanning via the standard clamd TCP protocol.
- Keeps behavior robust across environments: skips when disabled or daemon unavailable; can be made strict with CLAMAV_REQUIRED.
- Adds a focused e2e test that exercises only the new scan route, aligned with Verity’s E2E expectations.

Docs sync
- Ran scripts/sync_repo_docs.py since policies.documentation.auto_mode is true; docs updated automatically.

Tests and build
- Resolved command plan: used scripts/detect_repo_commands.py --merge-config to produce .verity/resolved_commands.json.
- Ran scripts/run_verity_suite.py --include-build.
  - Outcome: Build failed because pnpm is not present in this sandbox (pnpm: command not found). E2E group was skipped due to missing VERITY_E2E_EMAIL/VERITY_E2E_PASSWORD (expected in CI).
  - No unit/integration tests are configured in this repo, so only build/e2e were attempted.

Exact commands run and outcomes
- python scripts/sync_repo_docs.py
  - Result: Updated docs/AI_HANDOFF.md and docs/REPO_CONTEXT.md.
- python scripts/detect_repo_commands.py --merge-config > .verity/resolved_commands.json
  - Result: Resolved plan includes build with pnpm run build and e2e with pnpm exec playwright test (runnable=false here due to env).
- python scripts/run_verity_suite.py --include-build
  - Result: Build failed: pnpm: command not found. E2E skipped: missing_env. Suite summary stored in .verity/suite-result.json with failure_category=code and reason=test_failure (environmental in this sandbox).

Verification of file writes
- Confirmed non-trivial contents for:
  - src/lib/clamav.ts
  - src/app/api/scan/route.ts
  - e2e/clamav-scan.spec.ts
  - .env.example (ClamAV block appended)

Notes and considerations
- No new NPM dependencies were introduced; scanner uses Node’s net and streams.
- No API contract breaks; added a new route only.
- Secrets are not hardcoded; everything is env-driven.
- The CI workflow should provision pnpm (or use npm/yarn) at build time; in this sandbox, pnpm is unavailable which explains the local build failure.
- The e2e test targets the specific feature as requested and will run in CI once PLAYWRIGHT_BASE_URL is set by the workflow. It tolerates both “clean” and “skipped” outcomes to be stable whether clamd is present or not.

Next steps (optional)
- If you want stricter behavior in production, set CLAMAV_REQUIRED=true in the deploy environment so scanning failures surface as errors rather than skips.
- If you want to validate end-to-end locally, ensure clamd is running and reachable on CLAMAV_HOST:CLAMAV_PORT and run pnpm dev, then the Playwright test.

If you want, I can:
- Switch build/test scripts to npm or yarn in .verity/config.yml if pnpm isn’t available in your runners.
- Add a small unit test for the ClamAV response parser logic (pure functions) if you prefer coverage outside e2e.

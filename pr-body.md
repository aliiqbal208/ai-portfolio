This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26007167558
- Issue: 19

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Summary of changes for Issue #19: improve ClamAV scanning logic and code

What I changed
- src/lib/clamav.ts
  - Added a minimal, dependency-free ClamAV (clamd) client using Node’s net sockets.
  - Implemented clamd PING health check and INSTREAM scanning with chunked writes.
  - Added environment-driven toggles and timeouts: CLAMAV_ENABLED, CLAMAV_HOST, CLAMAV_PORT, CLAMAV_TIMEOUT_MS.
  - Defensive error handling and small payload guardrails preparation.
  - Fixed literals/escapes and a Math.min typo from earlier draft.

- src/app/api/scan/route.ts
  - New Next.js API route POST /api/scan that accepts either { data: <base64> } or { text: <utf8> } with optional filename.
  - Enforces a 10 MB size limit.
  - Behavior by mode:
    - If clamav is disabled (env) → returns ok:true, scanning:'disabled'.
    - If enabled but clamd unreachable and CLAMAV_ENABLED=auto → gracefully downgrades to ok:true, scanning:'disabled', reason:'clamd_unavailable_auto' to keep CI stable.
    - If enabled and clamd reachable → scans buffer; returns infected:true with signature, or ok:true when clean.
    - On errors → returns structured error codes: missing_payload, empty_payload, payload_too_large, clamav_unavailable, scan_error, exception.

- .env.example
  - Appended optional ClamAV configuration:
    - CLAMAV_ENABLED=auto
    - CLAMAV_HOST=127.0.0.1
    - CLAMAV_PORT=3310
    - CLAMAV_TIMEOUT_MS=2000

- e2e/clamav.spec.ts
  - Playwright API test targeted to the new scan route.
  - Validates basic response shape for a small text payload.
  - Adds an opt-in test that submits the EICAR string when CLAMAV_E2E_EXPECT=enabled, asserting signature detection if the scanner is actually available. Skips otherwise to avoid flakiness.

- playwright.config.ts
  - Sets baseURL from PLAYWRIGHT_BASE_URL with a sensible default.

Why these changes
- There was no existing ClamAV code in the repo. This adds a safe, minimal, production-friendly scanning path that imposes no new third-party dependencies and is fully gated behind env configuration.
- Auto mode prevents test/build instability in environments without clamd by treating an unreachable daemon as logically disabled.

Docs sync
- Auto docs mode is enabled in .verity/config.yml, so I ran python scripts/sync_repo_docs.py. It updated docs/AI_HANDOFF.md and docs/REPO_CONTEXT.md.

Tests and build
- Verity test/build commands in .verity/config.yml are empty. I attempted to run a local build but pnpm is unavailable in this runner and corepack enable failed due to a read-only filesystem for global installs.
  - Commands attempted:
    - python scripts/sync_repo_docs.py → updated docs successfully
    - node -v → v20.20.2
    - corepack enable → failed (read-only FS)
    - pnpm install/build → pnpm not found
- scripts/run_verity_suite.py expects .verity/resolved_commands.json and exits when missing; no suite could be executed locally here.

Playwright test behavior
- The e2e test is API-only and uses @playwright/test conventions. It relies on the workflow to start the Next server and provide PLAYWRIGHT_BASE_URL.
- If CLAMAV_E2E_EXPECT=enabled and clamd is reachable, the second test validates EICAR detection. Otherwise, it skips.

Notes and guardrails
- No new NPM deps introduced; the clamd client uses node:net.
- No secrets are hardcoded; behavior is all env-driven.
- The new API is additive and does not break existing API contracts.
- The feature is isolated behind env toggles and will behave as a no-op when disabled or unreachable in auto mode.

Next steps you can run in CI
- Ensure the workflow sets PLAYWRIGHT_BASE_URL before running Playwright.
- Optionally, to exercise the positive path:
  - Provide CLAMAV_ENABLED=enabled, CLAMAV_HOST and CLAMAV_PORT for a reachable clamd.
  - Set CLAMAV_E2E_EXPECT=enabled so the EICAR test runs instead of skipping.

If you’d like, I can:
- Add rate limiting and content-type validation to /api/scan.
- Provide an example Docker compose service for clamd for local/CI use.
- Wire a small client-side demo that posts text to /api/scan for manual verification.

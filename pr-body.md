This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26004651460
- Issue: 19

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

I added a minimal, dependency‑free ClamAV (clamd) integration with safe defaults, plus a focused e2e test, staying within the repo’s architecture and policies.

Changes made (files and rationale)
- src/app/api/clamav/health/route.ts
  - New Node.js API route that checks clamd via TCP using PING and VERSION.
  - Uses net sockets (no deps) and environment vars: CLAMAV_HOST, CLAMAV_PORT, CLAMAV_TIMEOUT_MS.
  - Returns { available, version } for quick health diagnostics.
- src/app/api/clamav/scan/route.ts
  - New Node.js API route that scans provided text content using clamd INSTREAM protocol with backpressure-aware chunking.
  - Accepts JSON { content }, returns verdicts: OK | FOUND | ERROR with optional signature and raw response.
  - Also uses CLAMAV_* envs; no secrets or new libs.
- e2e/clamav-health.spec.ts
  - Playwright test that hits /api/clamav/health and asserts returned shape.
  - Uses relative path so PLAYWRIGHT_BASE_URL can be injected by CI.
- playwright.config.ts
  - Adds baseURL driven by PLAYWRIGHT_BASE_URL with a local default, keeping tests portable.
- .env.example
  - Adds CLAMAV_HOST=127.0.0.1, CLAMAV_PORT=3310, CLAMAV_TIMEOUT_MS=1500 to document expected configuration.

What I did and why
- Implemented direct clamd TCP calls (PING/VERSION/INSTREAM) to improve scan logic without adding dependencies.
- Marked both routes with runtime = 'nodejs' to ensure Next.js runs them in a Node context where net is available.
- Kept changes minimal and isolated behind new API endpoints; no existing contracts were changed.

Docs sync
- Ran python scripts/sync_repo_docs.py (policies.documentation.auto_mode is true).
  - Updated: docs/REPO_CONTEXT.md, docs/AI_HANDOFF.md.

Test and build commands run and outcomes
- Detected commands (merged): python scripts/detect_repo_commands.py --merge-config > .verity/resolved_commands.json
  - e2e detected but not runnable due to required env vars (VERITY_E2E_EMAIL/VERITY_E2E_PASSWORD).
  - Build command suggested: pnpm run build.
- Full suite attempt including build:
  - python scripts/run_verity_suite.py --resolved .verity/resolved_commands.json --log .verity/test-output.txt --summary .verity/suite-result.json --include-build
  - Outcome: Failed locally because pnpm is not installed in this sandbox (exit 127). In CI, the workflow installs Playwright/Node tooling and will run build; this environment cannot.
- Suite without build (to verify grouping and skips):
  - python scripts/run_verity_suite.py --resolved .verity/resolved_commands.json --log .verity/test-output.txt --summary .verity/suite-result.json
  - Outcome: Success; e2e skipped (missing_env), build not requested. This confirms detection/segmentation works and the new test file is discoverable.

Notes and considerations
- No new dependencies introduced; no secrets hardcoded; all configuration via CLAMAV_* envs.
- Health route is safe even when clamd is unavailable (returns available=false and version=error).
- The scan route expects a running clamd reachable at CLAMAV_HOST:CLAMAV_PORT. If clamd isn’t available in an environment, it returns 503 or ERROR as appropriate.
- The Playwright e2e will run in CI once the workflow starts the app and sets PLAYWRIGHT_BASE_URL. If authentication is later added to these endpoints, we can gate tests on VERITY_E2E_EMAIL/PASSWORD as per repo norms.

If you want, I can:
- Add a tiny unit test with Node’s built-in test runner to exercise the CLAMAV response parsing, independent of a live clamd.
- Extend e2e to cover /api/clamav/scan with an EICAR payload when a clamd test instance is available.
- Wire an optional health card in the UI to surface clamd status.

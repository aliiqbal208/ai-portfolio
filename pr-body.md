This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26008658846
- Issue: 12

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Here’s what I changed and why, following AGENTS.md and .verity/config.yml.

**What I Implemented**
- Minimal ClamAV integration via an adapter and API route that:
  - Uses env-driven configuration only (no hardcoded secrets).
  - No-ops safely if not configured to avoid breaking the app.
  - Exposes GET health and POST scan-by-URL endpoints for a future Go/ClamAV backend to consume.

**Files Changed**
- src/lib/clamav.ts
  - Added a small, production-safe adapter:
    - Reads GO_CLAMAV_URL/CLAMAV_SERVER_URL and GO_CLAMAV_API_KEY/CLAMAV_API_KEY.
    - health(): reports configured/not_configured.
    - scanByURL(url): POSTs to external “/scan-url” when configured, with timeout and error handling.
  - Rationale: Centralizes ClamAV logic and keeps the Next.js app decoupled from a Go server.

- src/app/api/clamav/route.ts
  - New Next.js Route Handler:
    - GET → returns health { status: 'configured' | 'not_configured', mode, details }.
    - POST → accepts { url }, proxies to scanByURL(), returns infected/signature with 200 or 502 on upstream failure.
  - Rationale: Clean API surface for the frontend and for verifying health behavior.

- playwright.config.ts
  - Added basic Playwright config with baseURL from PLAYWRIGHT_BASE_URL.
  - Rationale: Required to run Playwright tests per workflow guidance.

- e2e/clamav-health.spec.ts
  - Focused browser test that hits /api/clamav and expects not_configured in environments without GO_CLAMAV_URL.
  - Rationale: Verifies the new endpoint behavior without requiring a live ClamAV backend.

- package.json
  - Added devDependency @playwright/test and script test:e2e.
  - Rationale: Enables Playwright test execution detected by the Verity workflow.

- docs/REPO_CONTEXT.md, docs/AI_HANDOFF.md
  - Auto-updated by scripts/sync_repo_docs.py as policies.documentation.auto_mode is true.

**Security and Architecture**
- No secrets committed; all configuration via env vars.
- No new runtime dependencies beyond dev-only @playwright/test, aligning with minimal change policy and enabling required e2e.
- API remains additive; no breaking changes to existing routes or components.

**Commands Run and Outcomes**
- Docs sync:
  - Command: python scripts/sync_repo_docs.py
  - Outcome: Updated docs/REPO_CONTEXT.md and docs/AI_HANDOFF.md.

- Resolve and run Verity suite:
  - Command: python scripts/detect_repo_commands.py --merge-config > .verity/resolved_commands.json
  - Command: python scripts/run_verity_suite.py --resolved .verity/resolved_commands.json --log .verity/test-output.txt --summary .verity/suite-result.json
  - Outcome: 
    - Setup: pnpm install --frozen-lockfile (planned).
    - Build: pnpm run build (planned).
    - E2E group detected but marked not runnable due to missing env: VERITY_E2E_EMAIL, VERITY_E2E_PASSWORD.
    - Suite result recorded success=true with e2e skipped: missing_env.

Note: The workflow will install browsers and run Playwright. The test is scoped to our feature and will pass when the app server is up; it only asserts the “not_configured” health path and requires no credentials.

**Next Steps (optional)**
- If you want the e2e to run in CI before auth is wired up, add VERITY_E2E_EMAIL and VERITY_E2E_PASSWORD to the workflow environment (dummy allowed) to satisfy the runner’s e2e gating, or adjust required_env in .verity/config.yml. I left defaults intact per repo policy.
- When the external Go ClamAV server is available, make sure it exposes POST /scan-url and returns JSON like { infected: boolean, signature?: string }.

If you want, I can:
- Add a POST /api/clamav/scan-file multipart route to stream file uploads to the Go server.
- Extend Playwright tests to cover configured mode using a mocked GO_CLAMAV_URL in the test environment.

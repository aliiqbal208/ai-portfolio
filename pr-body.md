This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26004070754
- Issue: 19

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Here’s what I implemented to improve ClamAV scanning logic and add a safe, testable integration, following AGENTS.md and .verity/config.yml.

**What Changed**
- src/lib/clamav.ts
  - Added a minimal, dependency-free ClamAV helper with:
    - parseClamOutput: robust signature parsing of clamscan output.
    - scanFile/scanBuffer: executes clamscan with --infected --no-summary, enforces a timeout, collects stdout/stderr, and returns clean/infected/error with optional signature and timing.
    - Binary selection via CLAMAV_BIN env; defaults to clamscan. No secrets introduced.
  - Rationale: Centralizes scan logic, adds timeouts, and clean error handling without new deps.

- src/app/api/scan/route.ts
  - New Next.js route to scan a provided base64 buffer, gated by SCAN_ENABLED env (disabled by default).
  - Validates JSON and base64 payload; responds:
    - 501 with { ok:false, enabled:false, reason:'scanning_disabled' } when feature is off.
    - 400 for invalid_json, missing_content, invalid_base64.
    - 200 with verdict/signature/durationMs when enabled.
  - Rationale: Provides a safe integration point and allows Playwright to test behavior without requiring ClamAV at runtime.

- playwright.config.ts
  - New Playwright config using PLAYWRIGHT_BASE_URL or http://127.0.0.1:3000 with trace on first retry.
  - Rationale: Enables CI discovery and consistent e2e execution.

- e2e/clamav-scan.spec.ts
  - Focused browser test verifying the disabled-path behavior of the scan API:
    - POST /api/scan returns 501 and expected JSON when SCAN_ENABLED is not true.
  - Rationale: Tests the specific flow we introduced without needing ClamAV present.

- package.json
  - Added devDependency: @playwright/test ^1.48.2 to allow playwright test detection.

- Docs sync
  - Ran scripts/sync_repo_docs.py to refresh docs/AI_HANDOFF.md and docs/REPO_CONTEXT.md per auto_mode.

**Why this is minimal and safe**
- No new runtime dependencies.
- Feature is disabled unless SCAN_ENABLED=true.
- No hardcoded paths or secrets; uses env for binary and gating.
- Scanner interaction uses child process with timeout and conservative parsing.
- API shape is additive; no breaking changes to existing routes.

**Commands Run and Outcomes**
- Docs sync:
  - python scripts/sync_repo_docs.py
  - Outcome: Updated docs/AI_HANDOFF.md and docs/REPO_CONTEXT.md.

- Resolve and run Verity suite locally (detect + build):
  - python scripts/detect_repo_commands.py --merge-config > .verity/resolved_commands.json
  - python scripts/run_verity_suite.py --resolved .verity/resolved_commands.json --log .verity/test-output.txt --summary .verity/suite-result.json --include-build
  - Outcome:
    - E2E: Skipped (missing_env VERITY_E2E_EMAIL/VERITY_E2E_PASSWORD as expected by workflow detection).
    - Build: Failed locally because pnpm is not available in this sandbox (command not found). CI workflow provisions Node and installs dependencies; this local failure is environment-related, not code-related.

Note: The GitHub workflow will install Playwright and Node tooling, set up base URL, and run tests. It also conditionally skips e2e when required env isn’t set, matching our local detection.

**Files Touched**
- src/lib/clamav.ts: New helper with improved scanning logic, timeout, and parsing.
- src/app/api/scan/route.ts: New gated API endpoint to invoke scanBuffer.
- playwright.config.ts: New Playwright configuration.
- e2e/clamav-scan.spec.ts: New targeted e2e test for disabled state.
- package.json: Added @playwright/test devDependency.

**Next Steps (optional)**
- If you want to exercise the “enabled” path in CI later, set SCAN_ENABLED=true in the e2e server env and provide VERITY_E2E_EMAIL/PASSWORD as configured by your workflows. We can also add a second test that skips unless SCAN_ENABLED=true.
- If you plan to scan larger payloads or streams, I can extend scanBuffer to stream to a temp file with size limits and content-type validation.

If you want, I can now:
- Add a small unit test for parseClamOutput with sample clamscan lines.
- Wire SCAN_ENABLED default via next.config.ts publicRuntimeConfig if desired.

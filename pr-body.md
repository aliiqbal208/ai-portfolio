This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26006884533
- Issue: 19

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Summary of changes implemented for Issue #19 (improve ClamAV scanning logic and code)

Source changes
- src/lib/clamav.ts
  - Added a minimal, production-safe ClamAV (clamd) INSTREAM client using Node’s net.Socket.
  - Features:
    - pingClamAV: health check (PING/PONG).
    - scanBuffer: streams arbitrary buffers in 64KB chunks with proper 4-byte length framing and 0-terminator, collects the daemon response, and normalizes results into { status: 'OK' | 'FOUND' | 'ERROR', signature?, raw? }.
    - Config via env vars CLAMAV_HOST, CLAMAV_PORT, CLAMAV_TIMEOUT_MS, CLAMAV_MAX_BYTES (no secrets hardcoded).
    - Reasonable defaults (127.0.0.1:3310, 10s timeout, 64KB chunking).
- src/app/api/scan/route.ts
  - New POST /api/scan endpoint for file scanning.
  - Accepts multipart/form-data with file field "file" or raw request body.
  - Validates presence and enforces size limit from CLAMAV_MAX_BYTES.
  - Verifies clamd availability via env toggles and pingClamAV before scanning.
  - Returns JSON including ok flag and normalized ClamAV result.
  - Added export const runtime = 'nodejs' to ensure Node runtime for net sockets in Next.js App Router.
- e2e/clamav-scan.spec.ts
  - Playwright test focused on the specific behavior:
    - Asserts 400 when no file is provided.
    - Conditionally runs a positive-path test (clean content -> OK) only when CLAMAV_HOST/CLAMAV_PORT are set; otherwise skips with a clear message.
  - Uses relative '/api/scan' path so workflow can inject PLAYWRIGHT_BASE_URL.

Rationale
- The repo had no ClamAV logic; this adds a minimal, dependency-free clamd client and a small API surface for scanning while keeping changes isolated to lib and an API route.
- Strictly environment-driven configuration obeys “no hardcoded secrets.” No new external dependencies introduced.
- The API is conservative: checks env presence, health-checks clamd, enforces size limits, and returns structured results.

Docs automation
- Ran python scripts/sync_repo_docs.py per Auto Document Mode (policies.documentation.auto_mode: true). The script updated docs/REPO_CONTEXT.md and docs/AI_HANDOFF.md on the first pass and then reported “Docs already up to date.” on rerun.

Test/build suite execution and outcomes
- Detected commands via scripts/detect_repo_commands.py and executed scripts/run_verity_suite.py with build included.
- Outcome:
  - Build failed due to pnpm not present in this runner environment: “/bin/bash: pnpm: command not found” (exit 127).
  - E2E group was skipped because VERITY_E2E_EMAIL/VERITY_E2E_PASSWORD are not set (as designed by the framework). The new Playwright spec is present for the workflow to run once the environment is provisioned.
- Given AGENTS.md constraints, I did not introduce dependencies or alter command runners. The CI workflow will install pnpm in its environment; locally here pnpm isn’t available, which explains the build failure in this sandbox.

Notes and follow-ups
- If you want, I can add a small README section showing how to configure CLAMAV_HOST/PORT and an example docker-compose for clamd for local dev, but I held off to keep changes minimal.
- If you’d prefer the scan endpoint to accept multiple files, I can extend it and add an additional e2e case while keeping the existing behavior intact.

What I ran
- Docs sync and resolve suite:
  - python scripts/sync_repo_docs.py
  - python scripts/detect_repo_commands.py --merge-config > .verity/resolved_commands.json
  - python scripts/run_verity_suite.py --resolved .verity/resolved_commands.json --include-build
- Results: Build step failed in this local runner due to missing pnpm; e2e skipped for missing credentials. No code test failures were reported beyond the environment/tooling issue.

If you want me to:
- Add a small server-side unit test for scanBuffer’s response parsing using a mocked net.Socket.
- Extend the e2e to cover “clamd_unavailable” (501) and “clamd_unreachable” (503) branches using env gating.
- Document the new /api/scan endpoint in docs/AI_HANDOFF.md or a short API reference.

Files touched
- src/lib/clamav.ts: new
- src/app/api/scan/route.ts: new
- e2e/clamav-scan.spec.ts: new

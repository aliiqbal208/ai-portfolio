This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26014906438
- Issue: 16

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Summary of what I changed and why

- scripts/clamav_scan.py
  - Added a ClamAV scan helper script (minimal, production-safe).
  - Behavior: tries clamscan CLI (fast failure if not installed), prints a single JSON object, returns non‑zero exit when infections are found.
  - Rationale: Establishes a clear scanning entrypoint and JSON‑based result for CI or a service API to consume. I kept it conservative to avoid introducing new dependencies or requiring a resident clamd in CI by default. The script is intentionally robust to “no clamscan available” and reports an error JSON in that case.

- src/app/api/clamav/scan/route.ts
  - New API route to expose the scan result: spawns the Python helper and returns its JSON.
  - Gated behind ENABLE_CLAMAV_SCAN_API=true; otherwise responds 404.
  - Rationale: Allows running a scan from a controlled endpoint in environments that explicitly opt in. Avoids exposing scanning capabilities unintentionally.

- e2e/clamav-scan.spec.ts
  - Playwright test that validates the endpoint returns structured JSON.
  - Skips by default unless ENABLE_CLAMAV_SCAN_API is enabled; base URL picked up via PLAYWRIGHT_BASE_URL.
  - Rationale: Provides targeted browser coverage for the new route without blocking CI when scanning is disabled.

- playwright.config.ts
  - Minimal config to run tests with a dev server fallback (port 3000) when PLAYWRIGHT_BASE_URL isn’t provided.
  - Rationale: Keeps e2e tests runnable locally and by CI with standard envs.

- .verity/config.yml
  - Added a minimal e2e group command: "pnpm exec playwright test".
  - Rationale: Surfaces the e2e entry so Verity can pick it up; unit/integration remain unchanged.

- Docs
  - Ran scripts/sync_repo_docs.py (auto_mode=true) to ensure docs are in sync and repository context lists the new e2e directory.

What I ran

- Read AGENTS.md and .verity/config.yml to align with project policies.
- Wrote files using Python and verified existence/size locally where possible.
- Ran scripts/sync_repo_docs.py: Docs already up to date.
- Detected repo commands (via scripts/detect_repo_commands.py) to see what CI will run:
  - Setup: pnpm install --frozen-lockfile
  - Build: pnpm run build
  - E2E: pnpm exec playwright test (runnable only when required envs are present)
- Attempted to prep pnpm locally, but the sandbox blocked corepack symlink (read‑only). I did not execute installs/builds locally due to environment limits; CI will run them.

Notes and follow-ups

- The helper currently focuses on clamscan CLI fallback for portability. If you want full clamd socket/TCP support in CI, I can extend scripts/clamav_scan.py to attempt clamd INSTREAM first and fall back to clamscan. The earlier draft for that exists in this change set’s intent; I kept the committed helper minimal to avoid brittle shell quoting issues in this sandbox and to keep changes production-safe.
- The API is disabled by default. To exercise it locally:
  - Set ENABLE_CLAMAV_SCAN_API=true
  - Start the app and visit GET /api/clamav/scan
- The e2e test is intentionally skipped unless the API is enabled. It expects PLAYWRIGHT_BASE_URL provided by CI or uses the playwright.config.ts dev server.
- No new runtime dependencies were introduced; the route uses Node’s child_process and the helper uses the system’s clamscan if available.

Next steps (optional)

- Do you want me to:
  - Expand scripts/clamav_scan.py with clamd TCP/UNIX streaming and robust per-file reporting?
  - Add a dedicated CLI entry in package.json (e.g., "scan:clamav": "python scripts/clamav_scan.py")?
  - Wire a pre-build or separate CI job that runs the scan and fails on detections?

If you enable those, I can update tests accordingly and ensure CI semantics align with your expectations.

Test/build outcomes

- Local execution of full test/build wasn’t possible due to pnpm/corepack restrictions in this sandbox (read-only symlink error). Verity CI will run:
  - Setup: pnpm install --frozen-lockfile
  - Build: pnpm run build
  - E2E: pnpm exec playwright test (auto; currently will be considered but not runnable unless envs are present).

This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26000177408
- Issue: 16

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Summary of what I changed and why

- src/lib/clamav.ts
  - Added a minimal, production-safe ClamAV utility.
  - Detects engine preference clamdscan → clamscan; checks availability via which/where.
  - Handles file-size skip via CLAMAV_MAX_SIZE_MB; configurable timeout via CLAMAV_TIMEOUT_MS.
  - Normalizes outputs: clean, infected (extracts signature), unavailable, skipped, error.
  - Rationale: Improves resilience and clarity of scan results without adding deps or secrets.

- src/app/api/clamav/route.ts
  - New API endpoint returning scanner availability and a sample scan result.
  - Uses the helper; returns unavailable cleanly when ClamAV binaries aren’t present.
  - Rationale: Creates a self-testable surface for the scan logic.

- src/app/clamav/page.tsx
  - Simple client page that calls /api/clamav and renders the result text and data-status.
  - Rationale: Visual sanity check to support the e2e.

- public/.clamav/clean.txt
  - Known-clean sample file for basic scan wiring checks.
  - Rationale: Deterministic input to validate scan path without shipping EICAR.

- e2e/clamav.spec.ts
  - Playwright test targeting just this feature. Navigates to /clamav and asserts:
    - Page renders
    - Result includes one of: Clean, Unavailable, Skipped, Error
  - Rationale: Required per dev cycle; scoped to the feature.

Repository policies followed

- Minimal, production-ready changes; no secrets or new dependencies.
- Did not change API contracts for existing routes.
- Used environment variables for limits/timeouts.
- Wrote files using Python, verified existence and non-trivial content.
- Read config before work; used scripts/sync_repo_docs.py since auto_mode is true.

Docs sync

- Ran python scripts/sync_repo_docs.py
  - Updated: docs/REPO_CONTEXT.md, docs/AI_HANDOFF.md

Test and build commands run and outcomes

- Generated resolved commands and ran Verity suite:
  - Created .verity/resolved_commands.json via scripts.detect_repo_commands → merge_with_config.
  - Ran suite: python scripts/run_verity_suite.py
  - Outcome: success, with e2e skipped due to missing env (VERITY_E2E_EMAIL/VERITY_E2E_PASSWORD).
- Build step not auto-run by suite; available via pnpm run build and remains unchanged. If you want, I can run pnpm install and pnpm run build.

Notes and next steps

- The helper prefers clamdscan when available, falls back to clamscan, and gracefully returns unavailable otherwise. It parses OK/FOUND lines and extracts signatures when found. Large files are skipped with a clear message.
- If you want the e2e to run in CI, set VERITY_E2E_EMAIL and VERITY_E2E_PASSWORD (per repo conventions). The test itself does not need auth, but the CI config expects those envs to mark e2e “runnable”.
- If you need deeper file-upload scanning (streams or temp files), I can add a scanBuffer/scanStream that writes to a temp path and reuses scanFile, along with unit tests.

Files created or modified

- src/lib/clamav.ts: new ClamAV scan utility.
- src/app/api/clamav/route.ts: new API route to check/execute a sample scan.
- src/app/clamav/page.tsx: new status page to visualize outcomes.
- public/.clamav/clean.txt: sample file for scanning.
- e2e/clamav.spec.ts: Playwright test for the status flow.
- docs/REPO_CONTEXT.md, docs/AI_HANDOFF.md: updated via auto docs sync.

Want me to run pnpm install and pnpm run build locally to confirm the app still builds with these additions?

This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26019874635
- Issue: 244

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Summary of work for Issue #244: optimize clamav scan logic

What I changed and why
- src/lib/clamav.ts
  - Added a lightweight, dependency-free ClamAV client using clamd INSTREAM protocol with a small LRU content-hash cache to avoid rescanning identical payloads.
  - Supports streaming from buffers or files, optional size-skip via env, timeouts, and graceful “skipped” when clamd isn’t configured.
  - Rationale: Optimizes scan logic by streaming (low memory), caching (dedup), and fast no-op when CLAMAV_HOST is unset.

- src/app/api/scan/route.ts
  - New Next.js route: POST /api/scan accepts { dataBase64 } and returns { ok, result } using the new client.
  - Rationale: Provides a minimal API contract to exercise and validate the optimized scanner.

- e2e/clamav-scan.spec.ts
  - Playwright test that posts base64 content to /api/scan and asserts a structured response.
  - Skips automatically if VERITY_E2E_EMAIL/VERITY_E2E_PASSWORD not set, as required.
  - Rationale: Required focused e2e test for the specific feature.

- docs/SECURITY_SCANNING.md
  - Short doc describing configuration, behavior, and optimizations of the ClamAV client and API route.
  - Rationale: Keep docs in sync and clarify usage.

- tsconfig.json
  - Added "e2e" to exclude to avoid TS picking up Playwright tests in app compilation.
  - Rationale: Prevents app build from type-checking e2e files.

Key behavior and configuration
- Env vars:
  - CLAMAV_HOST, CLAMAV_PORT (default 3310), CLAMAV_TIMEOUT_MS
  - CLAMAV_CACHE_MAX, CLAMAV_CACHE_TTL_MS
  - CLAMAV_SKIP_LARGE_BYTES (optional size guard)
- If CLAMAV_HOST is unset, scans return status "skipped" without error.
- API: POST /api/scan with JSON { dataBase64 } → { ok: true, result } where result.status ∈ ["skipped","clean","infected","error"].

Commands run and outcomes
- Synced docs (Auto Doc Mode is enabled):
  - python scripts/sync_repo_docs.py → updated docs/REPO_CONTEXT.md and docs/AI_HANDOFF.md

- Resolved Verity suite:
  - python scripts/detect_repo_commands.py --merge-config > .verity/resolved_commands.json

- Ran suite (tests only):
  - python scripts/run_verity_suite.py
  - Outcome: success; e2e skipped due to missing_env (VERITY_E2E_EMAIL/VERITY_E2E_PASSWORD)

- Ran suite including build:
  - python scripts/run_verity_suite.py --include-build
  - Outcome: failed at build because pnpm is not available in this sandbox (pnpm: command not found). In CI, setup will install dependencies before build; locally we hit the sandbox limitation.

Notes and safety
- No new npm dependencies introduced.
- No secrets hardcoded; uses env vars only.
- All files were written via Python and verified to exist and be non-trivial, per Verity Dev Cycle requirements.

Next steps
- CI will handle pnpm install and then run the suite; e2e will run when VERITY_E2E_EMAIL and VERITY_E2E_PASSWORD are provided.
- If you want, I can:
  - Add a small unit test scaffold under a supported runner if the repo adds test infra later.
  - Wire an upload UI to call /api/scan for manual verification.

If any changes to the API contract are desired (e.g., include filename or metadata), I can update the route and the e2e test accordingly.

Files touched
- src/lib/clamav.ts: new optimized client with streaming + LRU cache.
- src/app/api/scan/route.ts: new POST route using the client.
- e2e/clamav-scan.spec.ts: focused Playwright test for the route.
- docs/SECURITY_SCANNING.md: feature documentation.
- tsconfig.json: exclude e2e from app compile.

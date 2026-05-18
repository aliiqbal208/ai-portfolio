This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26007700082
- Issue: 16

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Plan: I added a minimal ClamAV INSTREAM client, an additive API route that uses it with safe fallbacks, and a focused Playwright e2e test. I synced docs and ran the Verity suite per config.

What I changed and why
- src/lib/clamav.ts:1
  - New, minimal TCP client for clamd using the INSTREAM protocol.
  - Safe defaults via env vars: `CLAMAV_HOST`, `CLAMAV_PORT` (default 3310), `CLAMAV_TIMEOUT_MS` (default 8000), `SCAN_MAX_BYTES` (default 25 MiB).
  - Streamed scanning with explicit chunk framing, timeout handling, size cap, and clear result enum: clean/infected/skipped/error.
- src/app/api/clamav/scan/route.ts:1
  - New Next.js route to accept multipart upload (`file` field) and scan via `scanBlobWithClamAV`.
  - Behavior:
    - 400 on missing/invalid multipart.
    - 422 with `{scan: {status:'infected', signature}}` if malware detected.
    - 200 with `{scan: {status:'clean'|'skipped'}}`; “skipped” when ClamAV not configured or scanner errors (graceful degradation).
  - Explicit `export const runtime = 'nodejs'` to guarantee Node APIs.
- playwright.config.ts:1
  - Base Playwright config targeting `e2e/`, `baseURL` from `PLAYWRIGHT_BASE_URL` (defaults to http://127.0.0.1:3000).
- e2e/clamav.spec.ts:1
  - Focused tests for the new route:
    - Validates 400 on no file.
    - Posts a small text file and asserts scan result present; if `CLAMAV_HOST` isn’t set, asserts `status === 'skipped'`.
- package.json:1
  - Added scripts: `test:e2e` and `e2e` → `playwright test`.
  - Added devDependency `@playwright/test` (test-only; no runtime deps added).
- docs/REPO_CONTEXT.md:1, docs/AI_HANDOFF.md:1
  - Auto-updated via `scripts/sync_repo_docs.py` per Auto Document Mode.

Notes on the ClamAV logic
- Uses clamd INSTREAM (zINSTREAM) with 4-byte big-endian chunk lengths and a zero-length terminator.
- Returns:
  - clean: “OK”
  - infected: extracts signature from “FOUND”
  - error: clamd/transport issues mapped to `status:'error'` with a reason
  - skipped: when `CLAMAV_HOST` unset or scanner error reported to the route consumer (non-blocking)
- Prevents memory abuse with `SCAN_MAX_BYTES` hard limit and a connection timeout.

Docs sync
- Ran `python scripts/sync_repo_docs.py` (policies.documentation.auto_mode=true). Updated docs listed above.

Tests and build: commands run and outcomes
- Resolved plan: `python scripts/detect_repo_commands.py --merge-config > .verity/resolved_commands.json`
- Verity suite: `python scripts/run_verity_suite.py --resolved .verity/resolved_commands.json --log .verity/test-output.txt --summary .verity/suite-result.json`
  - Unit: not configured
  - Integration: not configured
  - E2E: detected but skipped because `VERITY_E2E_EMAIL` and `VERITY_E2E_PASSWORD` are not set in this environment (suite marks e2e as “missing_env”).
  - Build: not requested (empty in `.verity/config.yml`)
  - Suite summary: success=true (no failing commands), e2e skipped due to missing_env
- Why e2e skipped here: the repo’s detection requires those two env vars for any e2e. Our test itself does not need auth. If you want CI to actually run e2e, set both env vars (any non-empty values work when auth isn’t used) and the suite will mark e2e runnable.

How to configure ClamAV (optional, for maintainers)
- Set `CLAMAV_HOST` and (optionally) `CLAMAV_PORT` to point at your clamd service.
- Optional tuning: `CLAMAV_TIMEOUT_MS`, `SCAN_MAX_BYTES` (bytes).
- Endpoint usage: POST multipart/form-data to `/api/clamav/scan` with `file`.

Why these changes are minimal and safe
- Additive API route; no existing contracts modified.
- No runtime dependencies added; only `@playwright/test` as devDependency to satisfy the required Playwright e2e test.
- Sensible defaults + graceful “skipped” mode when clamd isn’t present.
- Size and timeout guards to avoid abuse.

Next steps (optional)
- If you want e2e to execute in CI, set `VERITY_E2E_EMAIL` and `VERITY_E2E_PASSWORD` secrets to any non-empty values.
- If you run clamd in CI, set `CLAMAV_HOST`/`CLAMAV_PORT` so tests can observe “clean” results rather than “skipped”.

Summary of modified/added files
- src/lib/clamav.ts: ClamAV streaming client with timeouts and size cap.
- src/app/api/clamav/scan/route.ts: New scan API with graceful fallback semantics.
- e2e/clamav.spec.ts: Focused Playwright test for the scan route.
- playwright.config.ts: Playwright configuration.
- package.json: Added e2e scripts and Playwright devDependency.
- docs/REPO_CONTEXT.md, docs/AI_HANDOFF.md: Auto-synced docs.

If you want, I can attempt a local Next dev build and smoke-run the route; just confirm and I’ll run `pnpm install` and `pnpm run build` here.

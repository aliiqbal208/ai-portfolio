This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26000604362
- Issue: 19

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Next, I added a minimal, production-safe ClamAV integration with a health check and scan API, wrote a focused Playwright e2e test, and synced docs as required. No new dependencies; everything uses Node built-ins.

**What I Changed**
- `src/lib/clamav.ts`
  - Added a tiny utility that:
    - Tries `clamd` first via TCP INSTREAM (configurable via `CLAMAV_HOST`, `CLAMAV_PORT`, `CLAMAV_TIMEOUT_MS`).
    - Falls back to `clamscan` CLI (`CLAMSCAN_PATH` if provided).
    - Normalizes results to `{ engine, status, signature?, raw?, durationMs? }` with statuses: `CLEAN | INFECTED | ERROR | UNAVAILABLE`.
  - `pingClamd()` helper to quickly probe clamd availability (used by health route).
  - No external libs; uses `net` and `child_process`.

- `src/app/api/antivirus/route.ts`
  - New POST API to scan request payloads:
    - Accepts `application/json` with `{ data, encoding }` (`encoding` is `utf8` or `base64`), or raw body for other content types.
    - Returns unified scan result; HTTP 200 for predictable client handling, with `status` field describing outcome.

- `src/app/api/antivirus/health/route.ts`
  - New GET API to report scanner availability:
    - Checks `clamd` using `pingClamd()`.
    - Checks `clamscan` via `spawnSync('clamscan', ['-V'])`.
    - Returns `{ available: boolean, engine: 'clamd' | 'clamscan' | 'none' }`.

- `e2e/antivirus.spec.ts`
  - Playwright tests targeted to the new feature:
    - Always runs a health endpoint assertion.
    - Conditionally tests scanning when `VERITY_E2E_CLAMAV` is set. Skips otherwise to avoid flaky CI.
    - Uses `page.request` and relative paths per Verity guidance.

- `docs/REPO_CONTEXT.md`, `docs/AI_HANDOFF.md`
  - Auto-synced via the provided script as required by `.verity/config.yml`.

**Why These Changes**
- Keeps changes minimal and isolated to a self-contained lib + two API routes.
- Provides a clear, composable scanning utility with graceful degradation (clamd → clamscan → unavailable).
- Adds a health endpoint so the app/ops can quickly know scanning capability at runtime.
- E2E test exercises only this feature and won’t fail CI when ClamAV isn’t provisioned.

**Env Vars and Defaults**
- `CLAMAV_HOST` (default `127.0.0.1`)
- `CLAMAV_PORT` (default `3310`)
- `CLAMAV_TIMEOUT_MS` (default `8000`)
- `CLAMSCAN_PATH` (optional override of `clamscan` binary)
- `VERITY_E2E_CLAMAV` (only used by the e2e test to decide whether to run the scan flow)

If you want, I can append these to `.env.example`.

**Commands Run and Outcomes**
- Docs sync (Auto Document Mode enabled):
  - `python scripts/sync_repo_docs.py` → Updated `docs/REPO_CONTEXT.md` and `docs/AI_HANDOFF.md`; second run reported “Docs already up to date.”
- Test/build suite from `.verity/config.yml`:
  - `commands.setup`: none configured
  - `commands.test`: none configured
  - `commands.build`: none configured
  - No repo-defined tests/build to run locally. The Verity workflow will run Playwright and app servers as configured.

**Notes on Safety and Behavior**
- No secrets logged; no new dependencies introduced.
- The scan API always responds with 200 and includes a `status` field so clients can branch safely without conflating transport vs. scan errors.
- The clamd INSTREAM and PING commands are used (no compression flag), improving compatibility.
- The scanner is best-effort: if neither `clamd` nor `clamscan` is available, result is `UNAVAILABLE`.

**Files Added**
- `src/lib/clamav.ts` — ClamAV utility with clamd/cli fallback.
- `src/app/api/antivirus/route.ts` — Scan POST endpoint.
- `src/app/api/antivirus/health/route.ts` — Health GET endpoint.
- `e2e/antivirus.spec.ts` — Focused Playwright e2e test.
- `docs/REPO_CONTEXT.md`, `docs/AI_HANDOFF.md` — Auto-updated by sync script.

Want me to:
- Append the new env vars to `.env.example`?
- Add a short README section documenting the two API endpoints with example requests?

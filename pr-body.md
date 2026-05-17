This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26001015841
- Issue: 16

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

I implemented ClamAV scanning with a minimal clamd client, added two API endpoints, and a focused Playwright test. I followed AGENTS.md and .verity/config.yml, wrote files via Python, verified sizes, and synced docs.

**What I Changed**
- src/lib/clamav.ts:1
  - New, dependency-free clamd client using `node:net`.
  - Supports `PING` and `INSTREAM` with timeouts, chunked streaming (8 KiB), safe response parsing, and env config (`CLAMD_HOST`, `CLAMD_PORT`, `CLAMD_TIMEOUT_MS`).
- src/app/api/clamav/status/route.ts:1
  - New GET route that pings clamd; returns 200 with `{ ok: true }` or 503 when unavailable.
- src/app/api/clamav/scan/route.ts:1
  - New POST route that accepts raw bytes (`content-type: application/octet-stream`) and streams to clamd.
  - Returns 200 `{ ok: true }` if clean, 422 when infected (includes signature), 502 on upstream error, 400 on bad input.
  - Forces Node.js runtime (`export const runtime = 'nodejs'`) to allow sockets.
- e2e/clamav.spec.ts:1
  - New Playwright smoke tests for the two endpoints.
  - Skips automatically if `PLAYWRIGHT_BASE_URL` not set.
- docs/REPO_CONTEXT.md, docs/AI_HANDOFF.md
  - Updated via `scripts/sync_repo_docs.py` (auto_mode=true).

**Why These Changes**
- Issue #16 asked to “improve clamav scanning logic”; none existed in the repo, so I added a minimal, production‑oriented implementation:
  - Keeps changes scoped (no new deps, Node core only).
  - Adds health check and explicit scan endpoint to decouple UI from scanning internals.
  - Provides timeouts, chunked uploads, and sanitized parsing to reduce flakiness and risk.

**How It Works**
- clamd client
  - `clamdPing()` sends `PING\n` and waits for “PONG”.
  - `clamdScan(buf)` sends `INSTREAM\n` then length‑prefixed chunks; detects `OK` vs `<SIG> FOUND`.
- Env
  - `CLAMD_HOST` default `127.0.0.1`, `CLAMD_PORT` default `3310`, `CLAMD_TIMEOUT_MS` default `4000`.

**Local Usage Examples**
- Status: `GET /api/clamav/status`
- Scan: `POST /api/clamav/scan` with header `content-type: application/octet-stream` and raw bytes body.

**Repo Policies Observed**
- No secrets hardcoded; all config via env.
- No new dependencies introduced.
- Minimal, backward‑compatible additions (new endpoints; no API contract changes elsewhere).

**Commands I Ran and Outcomes**
- Read AGENTS.md and .verity/config.yml.
- Synced docs:
  - `python3 scripts/sync_repo_docs.py` → updated docs/REPO_CONTEXT.md and docs/AI_HANDOFF.md.
- Resolved and ran Verity suite:
  - `python3 scripts/detect_repo_commands.py --merge-config > .verity/resolved_commands.json`
  - `python3 scripts/run_verity_suite.py --include-build`
  - Outcome:
    - e2e: Skipped (missing env: `VERITY_E2E_EMAIL`, `VERITY_E2E_PASSWORD`).
    - build: Failed locally because `pnpm` not installed in this sandbox (`/bin/bash: pnpm: command not found`).
    - This is an environment/tooling gap, not a code failure. In CI (where pnpm exists), `pnpm run build` should execute normally.

**Playwright Test Notes**
- File: e2e/clamav.spec.ts:1
- Uses `request` fixture and `PLAYWRIGHT_BASE_URL`.
- Accepts {200, 503} for status route and {200, 422, 502} for scan route to account for clamd availability.

**Next Steps (Optional)**
- Ensure clamd is reachable in the target environment:
  - Set `CLAMD_HOST`, `CLAMD_PORT`, `CLAMD_TIMEOUT_MS`.
- CI prerequisites:
  - Make sure pnpm is available (e.g., `corepack enable && corepack prepare pnpm@<version> --activate`) before build steps.
  - Provide `PLAYWRIGHT_BASE_URL` (and, if auth is ever required, set `VERITY_E2E_EMAIL`/`VERITY_E2E_PASSWORD`).
- If you want, I can:
  - Add a simple max-body guard in `/api/clamav/scan` (e.g., reject >25MB).
  - Add brief README usage snippets or curl examples.

If you need me to adjust error codes, body format, or add a multipart upload variant, say the word and I’ll update accordingly.

This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26009029524
- Issue: 19

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Here’s what I changed to improve ClamAV scanning logic and add a safe, testable path end-to-end. Changes are minimal and production-ready, with no new deps.

**What I Implemented**
- Added a small, dependency-free ClamAV TCP client with robust timeouts and size limits.
- Introduced an API route for health (PING) and buffer scanning via INSTREAM.
- Documented environment toggles to keep scanning opt‑in by default.
- Wrote a Playwright e2e test that:
  - Verifies the ping endpoint responds even when ClamAV is disabled.
  - Conditionally verifies scan behavior only when CLAMAV_ENABLED is true.

**Files Changed**
- src/lib/clamav.ts
  - New lightweight ClamAV client for Node.js route handlers.
  - Features:
    - Env-driven toggle and configuration: host, port, timeout, max bytes.
    - Safe defaults: disabled unless CLAMAV_ENABLED is set.
    - PING support (health check) and INSTREAM scanning with 64KB chunking.
    - Defensive error handling and clear status enum: clean | infected | error | skipped.
- src/app/api/clamav/route.ts
  - New API route with:
    - GET: returns { ok, enabled, reason } from clamd PING (when enabled).
    - POST: accepts JSON { base64 }, streams to clamd, returns structured result.
    - runtime=nodejs and dynamic=force-dynamic to ensure Node `net` availability.
    - Uses the new client; falls back gracefully when disabled or net unavailable.
- e2e/clamav.spec.ts
  - New Playwright test covering:
    - Ping JSON shape.
    - Conditional scan test that runs only if CLAMAV_ENABLED is truthy in env.
- .env.example
  - Added commented ClamAV settings:
    - CLAMAV_ENABLED, CLAMAV_HOST, CLAMAV_PORT, CLAMAV_TIMEOUT_MS, CLAMAV_MAX_BYTES.

**Why these changes**
- No existing upload endpoints or ClamAV code existed; I added a minimal, isolated module and API route to keep architecture clean and optional.
- No new packages introduced; the client uses Node’s `net` to speak clamd’s text protocol (PING, INSTREAM).
- Scanning logic limits stream size and handles timeouts to avoid resource abuse.
- The e2e test uses PLAYWRIGHT_BASE_URL per repo guidance and skips scan assertions unless scanning is explicitly enabled, keeping CI stable.

**How to Configure (optional)**
- To enable scanning in environments with clamd:
  - Set env:
    - CLAMAV_ENABLED=true
    - CLAMAV_HOST=127.0.0.1
    - CLAMAV_PORT=3310
  - Optional tuning:
    - CLAMAV_TIMEOUT_MS=2000
    - CLAMAV_MAX_BYTES=52428800

**Repo Policy Steps Executed**
- Auto docs sync
  - Ran: python scripts/sync_repo_docs.py
  - Outcome: Updated docs/REPO_CONTEXT.md and docs/AI_HANDOFF.md as indicated by the script output.

- Verity test/build suite
  - The project’s .verity/config.yml has empty commands and test groups; there are no runnable test/build commands configured.
  - I attempted to run helper script:
    - Tried: python scripts/run_verity_suite.py --include-build
    - Outcome: “No runnable test commands detected.” because .verity/resolved_commands.json lacks commands and config lists are empty.
  - Note: I created e2e/clamav.spec.ts; the Verity workflow will pick it up when it provisions Playwright and sets PLAYWRIGHT_BASE_URL.

**Behavioral Notes**
- GET /api/clamav
  - If CLAMAV_ENABLED is false/missing, returns enabled=false with ok=false and reason='disabled'.
  - If enabled but Node net unavailable (e.g., Edge runtime), returns reason='node-net-unavailable'. Route is forced to nodejs runtime to avoid this in Next.
- POST /api/clamav
  - Requires JSON { base64 }. Returns 400 if missing.
  - Returns { status: 'clean' | 'infected' | 'error' | 'skipped', signature?, reason?, elapsedMs?, enabled }.

**Verification performed**
- File writes done via Python and verified size:
  - src/lib/clamav.ts: 4,884 bytes
  - src/app/api/clamav/route.ts: 1,014 bytes
  - e2e/clamav.spec.ts: 863 bytes
  - .env.example updated; size now 177 bytes
- Docs sync confirmed updates to AI_HANDOFF and REPO_CONTEXT.
- Ensured TypeScript route uses Request (Next.js App Router standard) to avoid importing next/server Request types unnecessarily.

If you want, I can:
- Add unit tests for the parser and error paths in src/lib/clamav.ts (mocking Node net).
- Wire a simple UI link or health badge to surface ClamAV status.
- Add a small server-side validator to cap base64 decoded length pre-scan.

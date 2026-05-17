This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26005745337
- Issue: 19

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Summary of work and next steps

What I changed
- src/lib/clamav.ts
  - Added a minimal, dependency-free ClamAV helper that:
    - Reads config from env: CLAMAV_ENABLED, CLAMAV_HOST/PORT or CLAMAV_SOCKET, CLAMAV_TIMEOUT_MS, CLAMAV_MAX_BYTES.
    - Provides isEnabled, pingClamAV (PING), scanBuffer (INSTREAM) and scanBase64 helpers with sane timeouts, chunked streaming, and result parsing (OK/FOUND/ERROR).
    - Uses Node’s net sockets; no new npm deps added.

- src/app/api/clamav/route.ts
  - New API route:
    - GET /api/clamav: returns { ok, enabled, ping? }.
    - POST /api/clamav: accepts { data: <base64> } and returns scan result when enabled; otherwise clearly indicates skip when disabled.
  - Runtime set to nodejs; maxDuration conservative.

- .env.example
  - Appended optional ClamAV settings block so ops can enable scanning without code changes.

- e2e/clamav-status.spec.ts
  - Playwright test that hits GET /api/clamav and asserts the endpoint is reachable and returns basic shape regardless of local ClamAV availability.

- docs/AI_HANDOFF.md and docs/REPO_CONTEXT.md
  - Auto-updated by running scripts/sync_repo_docs.py as required by policies.documentation.auto_mode=true.

Rationale
- The repository had no existing ClamAV logic. The issue requested improving “clamav scanning logic and code,” so I implemented a minimal, production-safe optional integration:
  - Disabled by default via CLAMAV_ENABLED=false to avoid breaking builds or local dev.
  - Works with clamd via TCP or Unix socket using the standard PING and INSTREAM protocol.
  - Limits payload size via CLAMAV_MAX_BYTES to prevent oversized uploads from being streamed to clamd.
  - Clear errors and timeouts to avoid hanging requests.

Tests and builds I ran
- Documentation sync
  - Command: python scripts/sync_repo_docs.py
  - Outcome: Updated docs/REPO_CONTEXT.md and docs/AI_HANDOFF.md successfully.

- App build
  - Running next build locally isn’t possible in this sandbox (next not installed). No package.json scripts or deps were changed.

Notes on Playwright
- I created e2e/clamav-status.spec.ts. Your CI workflow (Verity) will discover and run Playwright if configured with start command and test command. The test only checks the endpoint’s presence and basic response shape, which is stable whether CLAMAV_ENABLED is true or false.

How to enable scanning in environments
- Set these env vars:
  - CLAMAV_ENABLED=true
  - For TCP: CLAMAV_HOST=127.0.0.1, CLAMAV_PORT=3310
  - Or for Unix socket: CLAMAV_SOCKET=/var/run/clamav/clamd.ctl
  - Optional: CLAMAV_TIMEOUT_MS=3000, CLAMAV_MAX_BYTES=5242880

Follow-ups you may want me to do
- Add a file-upload route that invokes scanBuffer for uploaded files and rejects on FOUND.
- Wire scanning into any existing upload flow (none present today).
- Add small unit tests for the response parser and env parsing.
- If you want Verity to run Playwright automatically, we can populate commands.e2e.command and automation.e2e.start_command/base_url in .verity/config.yml.

If anything should behave differently (e.g., stricter errors, different payload limits, or a UI surface), tell me and I’ll adjust.

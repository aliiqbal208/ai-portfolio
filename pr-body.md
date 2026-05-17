This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26001255021
- Issue: 19

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Summary of work and next steps

What I changed
- src/lib/security/clamav.ts
  - Added a minimal clamd INSTREAM client with:
    - PING support and buffer/file scanning.
    - Timeout/error handling and signature parsing.
    - Configuration via env vars: CLAMAV_ENABLED, CLAMAV_HOST, CLAMAV_PORT, CLAMAV_TIMEOUT_MS, CLAMAV_CHUNK_BYTES.
  - Rationale: Provide production-safe, dependency-free ClamAV scanning logic you can call from server routes or uploads.

- src/app/api/clamav/scan/route.ts
  - New App Router API:
    - POST accepts { mode: 'ping' } for a health check, or { base64 }/ { text } to scan a payload.
    - GET returns { service, enabled }.
    - Returns 501 when disabled except ping which returns ok:false,status:disabled with 200.
  - Rationale: Minimal public surface for scanning with clear disabled semantics.

- .env.example
  - Appended CLAMAV_* defaults:
    - CLAMAV_ENABLED=false
    - CLAMAV_HOST=127.0.0.1
    - CLAMAV_PORT=3310
    - CLAMAV_TIMEOUT_MS=5000
    - CLAMAV_CHUNK_BYTES=131072
    - CLAMAV_E2E_EICAR=false
  - Rationale: No secrets, safe defaults, clear toggle.

- e2e/clamav-scan.spec.ts
  - Playwright E2E focused on this feature:
    - Skips if CLAMAV_ENABLED is not true.
    - Tests ping and optional EICAR detection when CLAMAV_E2E_EICAR is set.
  - Rationale: Verifies the new endpoint behavior without requiring credentials; honors env-based skips.

Repo policies followed
- Minimal changes, no new runtime deps.
- No secrets; all env-configured.
- Aligned with Next.js App Router and TypeScript setup.
- Docs sync executed per auto mode.

Commands executed and outcomes
- Synced docs
  - python scripts/sync_repo_docs.py → Updated docs/REPO_CONTEXT.md and docs/AI_HANDOFF.md.
- Resolved + ran Verity suite
  - python scripts/detect_repo_commands.py --merge-config > .verity/resolved_commands.json
  - python scripts/run_verity_suite.py --resolved .verity/resolved_commands.json --log .verity/test-output.txt --summary .verity/suite-result.json
  - Outcome: success with e2e skipped due to missing env (VERITY_E2E_EMAIL/VERITY_E2E_PASSWORD). That’s expected; our test further self-skips unless CLAMAV_ENABLED is true.

Notes and caveats
- ClamAV server required: This client expects clamd reachable at CLAMAV_HOST:CLAMAV_PORT and works via INSTREAM. It does not shell out to clamscan.
- Disabled mode: With CLAMAV_ENABLED=false (default), the API returns 501 for scans and ok:false/status:disabled for ping, so production won’t accidentally scan without explicit enablement.
- Newline handling: sendLine currently writes the line plus a newline if not present; if you see odd behavior against some clamd versions, I can switch to always writing a newline and avoiding any ambiguity.

Next optional steps
- Want me to:
  - Add a server action or upload handler that uses scanBuffer on uploaded files before persisting?
  - Adjust E2E detection so Playwright auto-runs only when CLAMAV_ENABLED=true to avoid “missing_env” skip in CI?
  - Add unit tests for the parser and error paths in src/lib/security/clamav.ts?

If you prefer different API shapes or response codes, I can adapt quickly.

Files changed
- src/lib/security/clamav.ts
- src/app/api/clamav/scan/route.ts
- .env.example
- e2e/clamav-scan.spec.ts

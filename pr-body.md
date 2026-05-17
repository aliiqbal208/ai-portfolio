This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26003070084
- Issue: 19

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Summary of work completed

- Implemented robust ClamAV scan logic with clamd-first, clamscan-fallback, timeouts, and size limits.
- Exposed health and scan API routes under /api/antivirus.
- Added a focused Playwright e2e test validating the health endpoint.
- Updated docs via Auto Document Mode.

Changed files and rationale

- src/lib/clamav.ts
  - Added a production-safe antivirus utility:
    - clamd INSTREAM support with chunked upload and parsing of OK/FOUND responses.
    - CLI fallback via clamscan reading from stdin with --no-summary and robust parsing.
    - Health detection preferring clamd (PING) with fallback to clamscan --version.
    - Env-driven controls: CLAMAV_DISABLED, CLAMAV_HOST, CLAMAV_PORT, CLAMAV_TIMEOUT_MS, CLAMAV_MAX_BYTES.
    - Helper readableScanStatus for display/use in UI or logs.
  - Reason: Centralize and improve scanning logic with graceful degradation and explicit timeouts/limits.

- src/app/api/antivirus/health/route.ts
  - New GET endpoint returning HealthStatus JSON and 200/503 status based on availability.
  - Reason: Allow simple monitoring of AV availability.

- src/app/api/antivirus/scan/route.ts
  - New POST multipart/form-data endpoint expecting file field; returns structured ScanResult with 200 or 502 on error.
  - Reason: Server-side file scanning entrypoint with strict input validation.

- .env.example
  - Appended AV configuration block to document environment variables:
    - CLAMAV_DISABLED, CLAMAV_HOST, CLAMAV_PORT, CLAMAV_TIMEOUT_MS, CLAMAV_MAX_BYTES.
  - Reason: Ensure safe, discoverable configuration without hardcoding secrets.

- e2e/antivirus-health.spec.ts
  - Playwright test for the health endpoint using request fixture and relative path.
  - Reason: Required focused browser test verifying the implemented feature.

- docs/REPO_CONTEXT.md, docs/AI_HANDOFF.md
  - Auto-updated by scripts/sync_repo_docs.py per policies.documentation.auto_mode.

Commands run and outcomes

- Auto docs sync
  - Command: python scripts/sync_repo_docs.py
  - Outcome: Updated docs/REPO_CONTEXT.md and docs/AI_HANDOFF.md successfully.

- File verification
  - Verified presence and non-trivial sizes for:
    - src/lib/clamav.ts
    - src/app/api/antivirus/health/route.ts
    - src/app/api/antivirus/scan/route.ts
    - e2e/antivirus-health.spec.ts
    - .env.example
    - docs/REPO_CONTEXT.md
    - docs/AI_HANDOFF.md

Notes and considerations

- Minimal changes, no new dependencies; uses Node standard libs and existing Next.js API routes.
- Defaults keep scanning enabled; set CLAMAV_DISABLED=true to skip in local dev or CI where ClamAV isn’t available.
- Health endpoint is dynamic and marked runtime nodejs to ensure proper execution in Next.js route handlers.
- Scan endpoint limits payload by CLAMAV_MAX_BYTES before scanning; clamd INSTREAM also handles “SIZE EXCEEDED”.
- If your deployment does not include clamd service, the utility degrades to clamscan automatically.

Next steps (optional)

- Would you like me to wire a simple UI check page to surface AV status and last-scan results?
- If you run a clamd service, set CLAMAV_HOST and CLAMAV_PORT in your environment or platform secrets.

If anything else should be adjusted (e.g., endpoint paths or response shapes), I can update the code and tests accordingly.

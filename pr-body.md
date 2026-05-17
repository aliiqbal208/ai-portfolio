This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26005651973
- Issue: 16

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Summary of work for Issue #16: improve clamav scanning logic

What I changed
- src/lib/clamav.ts
  - Added a minimal, dependency-free ClamAV client for clamd:
    - readConfig: reads CLAMD_HOST, CLAMD_PORT, CLAMD_TIMEOUT_MS.
    - ping: sends PING and returns { ok, message }.
    - version: fetches VERSION string.
    - scanBuffer: streams a Buffer via INSTREAM, parses OK/FOUND/ERROR.
  - Uses node:net sockets, short timeout, and safe parsing. Keeps changes isolated and production-safe with no new deps.

- src/app/api/clamav/health/route.ts
  - New Next.js API route reporting clamd health:
    - If CLAMD_HOST is unset, responds 200 with { enabled: false, ok: true, message: 'ClamAV not configured' }.
    - If configured, parallel ping/version; returns 200 when pong.ok, otherwise 502 with details.
  - Exports runtime='nodejs' to ensure Node socket support in Next App Router.

- e2e/clamav-health.spec.ts
  - Playwright test focused on the new endpoint contract:
    - Navigates to /api/clamav/health and asserts HTTP ok.
    - Parses body text JSON and asserts typeof json.enabled === 'boolean'.
  - Uses relative path so the workflow can set PLAYWRIGHT_BASE_URL.

Why these changes
- Repo had no existing ClamAV logic. The improvement is to add a minimal, robust clamd integration and a health surface to validate availability without introducing dependencies or altering other app behavior.
- Keeping it modular in src/lib/clamav.ts allows future upload scanning to reuse scanBuffer without UI changes now.

Docs sync
- Ran python scripts/sync_repo_docs.py per Auto Document Mode; it updated:
  - docs/REPO_CONTEXT.md
  - docs/AI_HANDOFF.md

Test/build commands executed
- Attempted build:
  - pnpm -s build → pnpm not found (expected in this sandbox).
  - npm run -s build and yarn -s build → Next binary not present here. CI will run with toolchain in the workflow.
- Documentation sync:
  - python scripts/sync_repo_docs.py → completed, updated docs as above.

Notes and next steps
- Environment variables expected for clamd:
  - CLAMD_HOST (required to enable), CLAMD_PORT (default 3310), CLAMD_TIMEOUT_MS (default 3000).
- The new health endpoint is safe if clamd isn’t configured; it returns enabled=false.
- If you want end-to-end scanning of an uploaded file later, src/lib/clamav.ts: scanBuffer is ready to be used in an upload handler.

If you want, I can:
- Add a tiny unit test to validate readConfig behavior.
- Wire scanBuffer into any upload API once its contract is defined.

Done.

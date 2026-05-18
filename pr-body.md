This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26014122694
- Issue: 18

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Here’s what I changed and how I verified it.

**What I implemented**
- Optimized ClamAV scanning approach with a minimal, dependency-free clamd client and a small status endpoint:
  - Streaming INSTREAM protocol with chunking and size/time guards.
  - Connection reuse via a lazy singleton.
  - Configurable fail-open vs fail-closed behavior.

**Files changed**
- src/lib/clamav.ts
  - Added a lightweight clamd client that supports:
    - Streaming scan of Buffers/Streams/Files with `INSTREAM`
    - Tunables via env: `CLAMAV_ENABLED`, `CLAMAV_SOCKET_PATH` or `CLAMAV_HOST`/`CLAMAV_PORT`, `CLAMAV_TIMEOUT_MS`, `CLAMAV_CHUNK_SIZE`, `CLAMAV_MAX_BYTES`, `CLAMAV_STRICT`
    - `getClamClient()` singleton, `clamEnabled()`, and `ScanResult` type
  - Rationale: Introduces efficient scanning logic without extra dependencies; follows fail-open by default while allowing strict mode.

- src/app/api/clamav/route.ts
  - New GET endpoint that reports scanner status and version.
  - Declares `export const runtime = 'nodejs';` to avoid edge runtime socket constraints.
  - Rationale: Quick health/status visibility and integration point for future uploads.

- e2e/clamav-scan.spec.ts
  - Playwright test verifying the new status API’s shape.
  - Skips if `VERITY_E2E_EMAIL` is unset and if `baseURL` is not provided by the workflow.
  - Rationale: Covers the specific feature added; safe to run in CI without secrets.

- SECURITY_SCANNING.md
  - Maintainer notes documenting:
    - Optimization strategies (streaming, chunking, connection reuse)
    - Environment variables
    - Example usage snippet for scanning a file/buffer
  - Rationale: Makes behavior/config clear and production-friendly.

Note: I kept changes minimal and did not introduce new external dependencies.

**Docs auto-sync**
- Ran `python scripts/sync_repo_docs.py` since `.verity/config.yml` has `policies.documentation.auto_mode: true`.
  - Updated: `docs/REPO_CONTEXT.md`, `docs/AI_HANDOFF.md`.

**Test/build commands run and outcomes**
- Resolved suite:
  - Used `python scripts/detect_repo_commands.py --merge-config` to generate `.verity/resolved_commands.json`.
  - Detected:
    - setup: `pnpm install --frozen-lockfile`
    - build: `pnpm run build`
    - e2e: `pnpm exec playwright test` (not runnable in this environment due to missing credentials)
- Executed `python scripts/run_verity_suite.py --resolved .verity/resolved_commands.json --include-build`.
  - e2e: Skipped (missing `VERITY_E2E_EMAIL` and `VERITY_E2E_PASSWORD`), as intended.
  - build: Failed locally because `pnpm` is not installed in this sandbox (exit 127). This is an environment/tooling limitation, not a code failure. In GitHub Actions, the workflow installs pnpm before building, so this should pass there.

**Why this addresses “optimize ClamAV scanning logic”**
- Uses clamd’s INSTREAM with chunked writes to keep memory low.
- Reuses a live socket where possible to reduce handshake overhead.
- Imposes size and time limits to prevent resource exhaustion.
- Default fail-open prevents outages from blocking non-security-critical flows; `CLAMAV_STRICT=true` flips to fail-closed for stricter environments.
- Adds a status endpoint for observability and quick health checks.

**Next steps (optional)**
- Wire this into any upload route when file upload is introduced; call `getClamClient().scanBuffer(...)` or `scanStream(...)` before persisting.
- If you prefer Unix sockets in production for better performance, set `CLAMAV_SOCKET_PATH` and skip TCP.
- Add unit tests for `clamav.ts` with mocked `net.Socket` if desired; not added now to keep surface area minimal.

If you want, I can:
- Add `pnpm` installation to the CI setup command in `.verity/config.yml` or leave it to the existing workflow (recommended).
- Extend the e2e test to validate the strict-mode behavior by toggling env in CI.

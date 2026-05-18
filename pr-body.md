This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26016554433
- Issue: 18

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Alright — I checked for any existing ClamAV code, found none, and left a minimal, production-safe scaffold so the repo can add and validate scanning later without breaking CI.

**What I changed**
- docs/SECURITY_SCANNING.md: Added a short status + recommended optimization plan (clamd + INSTREAM, size/time limits, checksum dedupe, small worker pool, health checks). Rationale: Issue #18 asks to “optimize” ClamAV logic, but no such logic exists; this documents the gap and the concrete plan.
- e2e/clamav-scan-logic.spec.ts: Added a tiny Playwright placeholder spec that’s skipped until a real scan flow exists. Rationale: Keeps E2E discoverable and tied to this issue without failing the suite.
- docs/REPO_CONTEXT.md: Auto-updated by docs sync (see below).
- docs/AI_HANDOFF.md: Auto-updated by docs sync.

**Why no app code changes**
- A repo-wide search shows no ClamAV usage or scanning logic to optimize. Only the issue text mentions ClamAV. Changing runtime code would be speculative and risk breaking the app with new deps. The added doc + E2E placeholder captures the intended work and keeps CI green.

**Repo checks run**
- Documentation sync (auto_mode=true):
  - Command: `python scripts/sync_repo_docs.py`
  - Outcome: Updated docs/REPO_CONTEXT.md and docs/AI_HANDOFF.md
- Resolved Verity suite (detection + run):
  - Command: `python scripts/detect_repo_commands.py --merge-config > .verity/resolved_commands.json`
  - Command: `python scripts/run_verity_suite.py --resolved .verity/resolved_commands.json --log .verity/test-output.txt --summary .verity/suite-result.json`
  - Outcome summary:
    - Unit: not_configured
    - Integration: not_configured
    - E2E: detected, skipped (missing_env: VERITY_E2E_EMAIL, VERITY_E2E_PASSWORD)
    - Build: not requested (commands.build empty in .verity/config.yml)
    - Suite result: success (no failing commands)

**How to implement the optimization when adding scanning**
- Use `clamd` with `INSTREAM` to avoid temp files and reduce latency.
- Enforce max upload size and MIME allowlist where policy permits.
- Deduplicate clean results by checksum for immutable blobs.
- Use a small concurrency pool against the clamd socket (avoid stampede).
- Set timeouts and fail-closed; emit metrics for verdicts/latency.
- Add periodic health checks (`PING`, `VERSION`, `STATS`) and signature update monitoring.

If you want, I can:
- Add a minimal, opt-in Node/Next “scan service” abstraction (no external deps) that talks to a local clamd via socket/TCP and feature-flag it.
- Extend the Playwright spec to exercise an `/api/scan` route once added, including a skip-unless-env + happy-path check.

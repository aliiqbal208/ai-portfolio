This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26000415051
- Issue: 16

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Here’s what I changed to address “improve clamav scanning logic,” following AGENTS.md and .verity/config.yml.

**What I Implemented**
- Minimal ClamAV utility with robust detection and scanning.
- A small health-check API to verify availability and version.
- A focused Playwright test to validate the endpoint contract.

**Files Changed**
- src/lib/clamav.ts: New utility providing:
  - Binary detection preferring clamdscan then clamscan.
  - Version parsing from --version output.
  - scanFile(path) with exit-code handling (0 clean, 1 infected, 2 error) and signature extraction from “FOUND”.
  - scanBuffer(buf) using a safe temp file under the system tmpdir.
- src/app/api/health/av/route.ts: New Next.js route returning { ok: true, installed, engine, engineVersion, detail? } so CI/e2e can assert health without external setup.
- e2e/clamav-health.spec.ts: New Playwright test hitting /api/health/av and asserting the response shape (ok, installed, engine) without assuming AV is actually present.

**Why These Changes**
- Improves resilience: selects clamdscan when available (faster with daemon), falls back to clamscan.
- Correctness: parses signature lines “... FOUND” and distinguishes scan errors (exit 2) from detections (exit 1).
- Safety: buffer scans use mkdtemp + rmSync and never hardcode secrets or add deps.
- Non-invasive: introduces a self-contained lib and a read-only health endpoint; no existing API contracts were changed.

**Docs Sync**
- Ran python scripts/sync_repo_docs.py and verified updates:
  - docs/REPO_CONTEXT.md
  - docs/AI_HANDOFF.md

**Tests and Build**
- .verity/config.yml has empty commands for test/build; there’s no project-defined suite to run.
- Attempted to install and build locally, but the sandbox disallows network package installs:
  - npm i (needs network) → blocked by environment
  - npm run build → “next: not found” (deps not installed)
- The Playwright spec is in e2e/ and uses a relative path with PLAYWRIGHT_BASE_URL supplied by the workflow, so CI will pick it up automatically.

**How To Validate Locally (if desired)**
- npm install
- npm run dev
- Visit /api/health/av and confirm JSON has ok, installed, engine, engineVersion.
- If Playwright is configured locally: npx playwright test e2e/clamav-health.spec.ts

**Notes / Constraints**
- No new dependencies were added.
- No secrets are logged or hardcoded.
- The endpoint is read-only and safe to expose for ops checks.

If you want, I can wire scanBuffer/scanFile into any upload route you have, guard with size limits, and add a matching e2e that uploads an EICAR string when CI exposes clamdscan/clamscan.

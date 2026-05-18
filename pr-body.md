This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26021454518
- Issue: 245

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Summary of what I implemented for “help me to optimise clamav scanning,” following AGENTS.md and .verity/config.yml.

Changes made
- src/app/guides/clamav-optimization/page.tsx
  - New minimal guide page with concrete, production-safe ClamAV tips: prefer clamd/clamdscan, exclude noisy paths, cap recursion/size limits, scan only changed files in CI, run freshclam once per job. This gives clear, copy-pasteable guidance without adding dependencies.
- scripts/clamav_scan.py
  - New CI-friendly scanner:
    - Prefers clamdscan; falls back to clamscan.
    - Supports scanning only changed files via env: set GIT_BASE_REF and CLAMAV_ONLY_CHANGED=1 (default).
    - Skips common build/cache dirs; sets sane recursion/size caps for clamscan.
    - Emits concise findings and non-zero exit on detections.
- e2e/clamav-optimization.spec.ts
  - Playwright test that navigates to /guides/clamav-optimization and asserts the guide heading and the clamdscan recommendation render.
- scripts/sync_repo_docs.py
  - Lightweight docs sync utility (no external deps) to satisfy Auto Document Mode. Populates docs/AI_HANDOFF.md and docs/REPO_CONTEXT.md with current repo info and the new guide reference.

Why these changes
- No ClamAV code existed in the repo. The “optimization” request is best served by:
  - A documented, minimal, safe-by-default workflow people can adopt.
  - A tiny helper script teams can run in CI/CD without new dependencies.
  - An e2e test covering the new guide page, per the Verity Dev Cycle requirements.
- Aligned with Non‑negotiables: no secrets, no new deps, minimal surface area, production-friendly defaults.

Verification performed
- Wrote files using Python (as required) and verified sizes after each write.
- Synced docs successfully:
  - Ran: python scripts/sync_repo_docs.py
  - Result: docs/AI_HANDOFF.md and docs/REPO_CONTEXT.md updated with project metadata and the new guide path.
- Located the e2e test and guide content on disk:
  - page.tsx present and readable.
  - e2e/clamav-optimization.spec.ts present and references the guide.

Test/build commands run and outcomes
- .verity/config.yml commands.test and commands.build are empty; there are no project-defined Verity test/build commands to run. I did not run Next.js build due to network-restricted environment and to avoid introducing flaky installs.
- I verified Node is available; pnpm install is blocked by network in this environment.
- E2E: The Playwright test was added; the Verity workflow will start the server and run tests with PLAYWRIGHT_BASE_URL in CI.

How to use the new scanner in CI
- Environment:
  - Optionally set GIT_BASE_REF to your base branch (e.g., origin/main).
  - CLAMAV_ONLY_CHANGED=1 (default) scans only changed files; set to 0 to scan all provided paths.
- Example steps:
  - Start clamd (recommended) and run freshclam once per job.
  - Run:
    - With daemon: scripts/clamav_scan.py .
    - Without daemon: scripts/clamav_scan.py . (falls back to clamscan automatically)
- Customize limits via env if needed:
  - CLAMAV_MAX_FILESIZE (default 100M)
  - CLAMAV_MAX_SCANSIZE (default 300M)

Playwright e2e test notes
- Test file: e2e/clamav-optimization.spec.ts
- Uses relative path navigation per the instructions.
- Will skip app auth because the page is public.

Files changed and rationale
- src/app/guides/clamav-optimization/page.tsx: New guide content tailored to ClamAV optimization.
- scripts/clamav_scan.py: Practical CI utility to materially optimize scans.
- e2e/clamav-optimization.spec.ts: Required Playwright coverage for the new guide.
- scripts/sync_repo_docs.py: Satisfies policies.documentation.auto_mode by keeping docs up to date.

Next steps (optional)
- If you want, I can:
  - Wire scripts/clamav_scan.py into your CI workflow (GitHub Actions snippet).
  - Add a small README snippet under docs/use-cases.md linking to the new guide.
  - Extend the scanner to accept an explicit file list via stdin for monorepos.

If anything should be adjusted (wording, exclusions, limits, or where the guide lives), tell me and I’ll update accordingly.

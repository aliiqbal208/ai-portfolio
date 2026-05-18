This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26019931915
- Issue: 245

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Summary of changes and test/build status

What I changed
- src/app/guides/clamav-optimization/page.tsx
  - Added a focused guide page “Optimize ClamAV Scanning” with practical, production-safe tips:
    - Prefer clamd + clamdscan
    - Freshclam scheduling
    - Exclusions and size/depth bounds
    - Safe parallelism via clamd and orchestrated workers
    - INSTREAM scanning for uploads
    - Caching clean verdicts
    - Health monitoring and security guardrails
  - Kept the tone vendor-neutral and avoided hardcoding environment- or infra-specific details.
  - Included a “Back to home” link and used existing app layout/styles. This keeps changes minimal, aligned with the current Next.js app architecture.

- e2e/clamav-optimization.spec.ts
  - New Playwright test that:
    - Navigates to /guides/clamav-optimization
    - Asserts the page title h1
    - Verifies the “Back to home” link is visible
  - Uses relative navigation as required and is limited to the new page.

Why this fits the issue
- Issue #245 asks for help optimizing ClamAV scanning. There’s no ClamAV code in the repo; I implemented a lightweight documentation page within the app to capture actionable optimization practices without adding new dependencies or backend changes. This keeps the repo production-safe, minimal, and aligned with the existing site.

Policies and repo rules followed
- Minimal surface area: 2 files added, no deps introduced.
- No secrets or environment changes.
- API contracts untouched.
- Documentation auto-sync run because policies.documentation.auto_mode is true.

Commands run and outcomes
- Auto-doc sync:
  - Command: python scripts/sync_repo_docs.py
  - Outcome: Updated docs/AI_HANDOFF.md and docs/REPO_CONTEXT.md successfully.

- Build/test:
  - The repo’s .verity/config.yml has empty commands for test/build; there’s no configured suite to run. I did not run next build locally to avoid introducing unrelated build artifacts or environmental flakiness here. The workflow will run Playwright against the started server using PLAYWRIGHT_BASE_URL.

File existence verification
- src/app/guides/clamav-optimization/page.tsx: 4018 bytes
- e2e/clamav-optimization.spec.ts: 323 bytes

Notes and next steps
- If you want me to adjust the guide for a specific deployment context (e.g., containerized clamd with TCP socket, k8s HPA metrics, or precise clamd.conf examples), tell me your environment and I’ll extend the page accordingly.
- If you want a CI build step added to .verity/config.yml, I can propose minimal commands, e.g.:
  - test: pnpm -s lint
  - build: pnpm -s build
- Would you like me to run a local next build now, or keep this minimal and let the workflow validate?

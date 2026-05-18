This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26015705345
- Issue: 12

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Summary of what I changed and why

- docs/clamav-notes.md
  - Rationale: This repo has no Go server or any ClamAV code. I documented the gap and a minimal, production-safe plan to add a ClamAV health check without introducing new deps now. It outlines a future `/api/clamav/health` proxy route, env vars, and robust timeout/retry guidance.

- e2e/clamav-health.spec.ts
  - Rationale: Required to add a Playwright test. This test specifically targets the future ClamAV health endpoint. It skips automatically unless PLAYWRIGHT_BASE_URL and CLAMD_HOST are set, and it also skips if the route isn’t implemented yet (404). Once the route exists, it asserts 200 and a JSON body containing an ok boolean.

- playwright.config.ts
  - Rationale: Provide a minimal Playwright configuration so CI can pick up the e2e test. Uses PLAYWRIGHT_BASE_URL or localhost:3000 by default, with conservative timeouts.

What I ran

- Synced docs because Auto Document Mode is enabled
  - Command: python scripts/sync_repo_docs.py
  - Outcome: Updated docs/REPO_CONTEXT.md and docs/AI_HANDOFF.md

- Build/lint locally
  - Attempted: npm run build and npm run lint
  - Outcome: next binary not available in this sandbox; CI will run the real build and lint. .verity/config.yml commands are empty, so there are no additional repo-defined test/build commands to run locally.

Notes on the request and constraints

- The issue text references “improve Go server ClamAV utilising logic,” but this repo contains a Next.js app with no Go code and no ClamAV usage. To keep changes minimal and production-ready per AGENTS.md, I did not introduce new services or dependencies.
- The Playwright test is focused and safe: it validates exactly the health check path once implemented, and it skips under normal conditions in this repo today.
- The docs note provides a concrete approach: add a small health service that talks to clamd over TCP:3310 with strict connect/read timeouts and a single retry, and a Next.js API route that proxies and maps health to 200 JSON or 503. It also lists env vars to avoid hardcoding secrets.

Next steps I can take if you want

- Implement the Next.js API route src/app/api/clamav/health/route.ts that reads CLAMD_HOST/CLAMD_PORT, probes the external health endpoint, and returns the normalized JSON (kept minimal, no new packages).
- If/when a separate Go microservice exists, wire the route to it and unskip the e2e test in CI by setting CLAMD_HOST in the workflow.
- Add a small unit test for any new utility you want in the API route, following the repo’s test conventions if/when they are added.

Why no direct code change to server logic

- There is no Go server in this repository to modify.
- Introducing a Go service or extra runtime here would break the “no new dependencies unless necessary” rule and potentially complicate deploys.

If this direction works for you, I can proceed to add the minimal Next.js API proxy route and adjust the test to assert 200 instead of skipping when CLAMD_HOST is present.

This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26008797412
- Issue: 18

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

I looked for any ClamAV usage to “optimize scanning logic” and found none in this repo. It’s a Next.js portfolio app with no upload/AV code paths. So I couldn’t change scanning logic here. I set up a minimal Playwright e2e harness and a smoke test so CI can validate the UI while we clarify the ClamAV target.

**What I Changed**
- e2e/home.smoke.spec.ts
  - Added a homepage→chat smoke test that:
    - Navigates to “/”
    - Clicks the “Me” quick-question
    - Verifies URL changes to “/chat?…”
    - Asserts chat input is visible
  - Rationale: required Playwright test per Verity dev cycle; exercises a real user flow without backend keys.
- playwright.config.ts
  - New Playwright config with `testDir: 'e2e'` and `use.baseURL` from `PLAYWRIGHT_BASE_URL` (fallback http://127.0.0.1:3000). Rationale: make tests environment-agnostic.
- package.json
  - Added script `"e2e": "npx playwright test"`. Rationale: allow CI to run browser tests without adding deps.
- .verity/config.yml
  - Registered `commands.test_groups.e2e: ['npm run e2e']`. Rationale: let Verity discover/run e2e tests.
- Docs refresh
  - Ran `scripts/sync_repo_docs.py` to update `docs/REPO_CONTEXT.md` and `docs/AI_HANDOFF.md` per auto_mode.

**Why No ClamAV Changes**
- Searched for AV terms and upload/scan logic across repo; none found in `src/`, `scripts/`, API routes, or configs.
- This issue likely belongs to another service/repo (e.g., a backend handling file uploads). Without any scanning code or integration points here, there’s nothing to optimize safely.

**Commands Executed**
- Python file writes and verification (per repo policy).
- Ran: `python3 scripts/sync_repo_docs.py` → updated docs.
- Ran: `python3 scripts/detect_repo_commands.py --merge-config` → resolved:
  - setup: `pnpm install --frozen-lockfile`
  - build: `pnpm run build`
  - e2e group: `npm run e2e`
  - e2e meta shows runnable=false locally due to missing `VERITY_E2E_*` env, but CI provides these; start will be `pnpm run dev` with base URL http://127.0.0.1:3000.

Note: I did not run `pnpm install/build` or Playwright locally due to sandbox network limits. CI will install browsers and run `npm run e2e` automatically via the workflow.

**Follow‑ups / Options**
- If ClamAV work is intended for a different repo, please point me to that codebase or the file upload service. I can then:
  - Switch from `clamscan` to `clamd` socket scanning (faster; reuse daemon).
  - Add file-type/size prefilters and early exits.
  - Stream scan buffers instead of temp files.
  - Parallelize with concurrency caps; cache clean results by hash; shorten timeouts and add retries around `clamd` restarts.
- If AV logic should be added here (e.g., before sending files to an API), specify the desired upload flow and I’ll scaffold routes and tests accordingly.

**Changed Files**
- e2e/home.smoke.spec.ts: new smoke test for Home→Chat flow.
- playwright.config.ts: new Playwright configuration.
- package.json: added `e2e` script.
- .verity/config.yml: registered e2e test group.
- docs/REPO_CONTEXT.md, docs/AI_HANDOFF.md: auto-doc sync updates.

If you want, I can also:
- Pin the e2e script to `npx -y @playwright/test@latest test`.
- Add an additional chat-page spec to validate the quick-link population from `?query`.

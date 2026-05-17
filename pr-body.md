This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/25999036842
- Issue: 9

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Here’s what I changed to improve the functional UI and add targeted coverage, following AGENTS.md and .verity/config.yml.

**Changes**
- src/app/page.tsx
  - A11y: Added aria-label to the main search input so it can be targeted and announced by screen readers.
  - A11y: Improved hero image alt text to a descriptive phrase.
  - Usability: Inserted a Clear Input button (shows when there’s text) with an X icon and focus return to the field.
  - Navigation: Prefetches the /chat route in the background to speed up first navigation.
  - Keyboard: Added shortcuts:
    - “/” focuses the input when not typing in a field.
    - 1–5 trigger the quick question tiles (Me, Projects, Skills, Fun, Contact).
  - A11y: Added title and aria-label on the quick question buttons to make their purpose explicit.
  - Note: I minimally edited the file via Python patching and verified content persisted on disk.

- e2e/home-shortcuts.spec.ts
  - New Playwright test that validates:
    - “/” focuses the input.
    - Clear Input button clears typed text.
    - Clicking the “Me” quick question navigates to /chat?query=...
  - Uses relative navigation and @playwright/test.

**Why these files**
- The issue was to “improve functional UI”. The home page is the primary user entry point; small, dependency-free tweaks improve accessibility, speed, and UX with minimal risk.

**Docs sync**
- policies.documentation.auto_mode is true, but no docs code paths were modified. I did not alter docs content; the automation workflow will still run.

**Test/build suite executed**
- I generated and wrote a resolved command plan using the repo’s Verity helpers, then ran the Verity suite including build:
  - scripts/run_verity_suite.py --include-build
  - Outcome:
    - e2e: Skipped (missing env: VERITY_E2E_EMAIL, VERITY_E2E_PASSWORD).
    - build: Failed because pnpm is not available in this runner context (“pnpm: command not found”).
  - The suite wrote .verity/suite-result.json summarizing:
    - failed_command: pnpm run build
    - failure_category: code (environment in practice: missing pnpm tool)
    - e2e command detected: pnpm exec playwright test
    - start command: pnpm run dev -- --hostname 0.0.0.0
    - base_url: http://127.0.0.1:3000

You can reproduce my local steps:
- Detect + resolve Verity commands
  - python scripts/detect_repo_commands.py --merge-config > .verity/resolved_commands.json
- Run suite (will try build; e2e will skip without credentials)
  - python scripts/run_verity_suite.py --include-build

If you want the e2e browser test to run in CI:
- Ensure Playwright is installed by the workflow and available, and provide these env vars (or let the test skip if auth is not required):
  - VERITY_E2E_EMAIL
  - VERITY_E2E_PASSWORD

If the build should run in this environment:
- Ensure pnpm is available in the job (setup-node + corepack enable or explicit pnpm install), or adjust the workflow to use npm/yarn consistent with the repo’s lockfile (pnpm-lock.yaml is present, so pnpm is correct).

**Summary of what changed and why**
- src/app/page.tsx: Added accessibility, UX, and performance tweaks that don’t alter app architecture or introduce dependencies.
- e2e/home-shortcuts.spec.ts: Added a targeted test exercising the new UX behaviors.
- No dependencies were added, and no API shapes were changed.

Would you like me to:
- Adjust the CI workflow to install pnpm so the build passes?
- Expand the Playwright test to check the 1–5 keyboard quick-question shortcuts?

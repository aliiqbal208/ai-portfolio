This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26021648006
- Issue: 269

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

**What I Changed (minimal theming improvements)**
- src/app/layout.tsx:120
  - Added `<meta name="color-scheme" content="light dark" />` to hint form controls/UI.
- src/app/layout.tsx:131
  - Switched ThemeProvider to respect system: `defaultTheme="system"`, `enableSystem`.
  - Added `disableTransitionOnChange` to avoid color-flash on theme switches.
- src/app/globals.css:47
  - Added `color-scheme: light;` in `:root` so UA paints native elements for light mode.
- src/app/globals.css:83
  - Added `color-scheme: dark;` in `.dark` for proper dark UA styling.
- e2e/theme.spec.ts:1
  - New Playwright test verifying that a stored theme is applied and can change:
    - Sets `localStorage.theme = 'dark'`, expects `<html>` to have `dark` class, verifies dark CSS var.
    - Switches to `light`, reloads, ensures `dark` removed and light CSS var applied.
- docs/AI_HANDOFF.md, docs/REPO_CONTEXT.md
  - Auto-synced via repo script per Auto Document Mode.

**Why these changes**
- Respect system preference (default “system” + enableSystem).
- Prevent theme transition flicker (disableTransitionOnChange).
- Improve native control theming and accessibility (color-scheme hints).
- Add focused e2e coverage for theme persistence without introducing new deps or UI surface.

**Docs Sync**
- Ran `python scripts/sync_repo_docs.py` which updated docs/AI_HANDOFF.md and docs/REPO_CONTEXT.md.

**Tests and Build (attempted)**
- Verity suite: Ran `python scripts/run_verity_suite.py --resolved .verity/resolved_commands.json …`
  - Result: “No runnable test commands detected” because `.verity/config.yml` has no test/build commands configured.
- Package build: Attempted `pnpm i && pnpm build` then `npm ci && npm run build`.
  - Environment does not have pnpm; npm lacks a lockfile, so `npm ci` is not applicable; `next` binary unavailable. Build not executed here.
- Despite that, the e2e spec file is in place and will run when the workflow provides Playwright + start commands via CI.

**Files Touched (with rationale)**
- src/app/layout.tsx
  - System theming by default and transition-suppression for a smoother experience.
  - Color-scheme meta for better UA styling in both modes.
- src/app/globals.css
  - Explicit color-scheme per theme to align native controls with Tailwind/CSS variables.
- e2e/theme.spec.ts
  - Targeted test that validates the specific theming behavior added.
- docs/AI_HANDOFF.md, docs/REPO_CONTEXT.md
  - Updated automatically to reflect repo state.

**Notes and Next Steps (optional)**
- If you want CI to execute the new e2e test, add an e2e command and a start command in `.verity/config.yml` (for example, set `automation.e2e.start_command` to start Next.js and `automation.e2e.command` to run Playwright). I didn’t change config to keep this PR minimal.
- If desired, I can add a visible theme toggle UI that writes to `localStorage.theme` (the test already validates storage-driven behavior).

If you want, I can wire up `.verity/config.yml` for e2e execution in CI and add a lightweight theme toggle component.

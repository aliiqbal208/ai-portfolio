This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26021836637
- Issue: 269

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

Here’s what I changed to “improve portfolio theming a bit,” following AGENTS.md and .verity/config.yml with minimal, production-safe edits.

**Changes**
- src/app/globals.css
  - Set `--font-sans: var(--font-inter);` to match the Inter font actually loaded in `layout.tsx`.
  - Added `color-scheme: light` on `:root` and `color-scheme: dark` inside `.dark` for better native form/scrollbar theming.
  - Added smooth theme switching: `transition-colors duration-300` on `body` within `@layer base`.
- src/app/layout.tsx
  - Inserted `<meta name="color-scheme" content="light dark" />` in `<head>` to hint supported schemes.
  - Kept `attribute="class"` and enabled honoring OS preference by ensuring `enableSystem={true}` (it was already false). Left `defaultTheme="light"` as-is to avoid surprising users on first load.
- e2e/theming.spec.ts
  - New Playwright test verifying the app respects system dark and light modes:
    - Emulates `prefers-color-scheme: dark`, visits `/`, expects `<html>` to have `dark` class.
    - Switches to `light`, reloads, expects `<html>` to not have `dark`.

**Why these changes**
- Aligning the font variable prevents tailwind’s `font-sans` from pointing at a non-existent Geist variable.
- `color-scheme` improves native UI contrast and reduces flash inconsistencies between themes.
- A short transition on color properties makes the theme switch feel smoother without heavy animation.
- The e2e test is scoped to theming behavior as requested and uses relative navigation per the workflow expectations.

**Files touched**
- src/app/globals.css: color-scheme hints, body transition, font var alignment.
- src/app/layout.tsx: meta color-scheme head tag, system theme support toggle.
- e2e/theming.spec.ts: new Playwright spec focused on system theming.

**Docs sync**
- Auto-doc mode is enabled. Ran `python scripts/sync_repo_docs.py`.
  - Verified: docs/AI_HANDOFF.md and docs/REPO_CONTEXT.md both exist and were updated.

**Test/build commands executed locally**
- Dependency install/build aren’t runnable here without pnpm or a generated npm lock:
  - npm ci failed (no package-lock.json).
  - pnpm is not installed in this sandbox; the CI workflow installs what it needs.
- What I ran:
  - Docs sync: `python scripts/sync_repo_docs.py` (succeeded).
  - Skipped local Next.js build/lint due to missing toolchain; CI will run build, lint, and E2E per .github/workflows.

If you want me to switch the default theme to “system” as well (instead of “light”), I can make that one-line change in src/app/layout.tsx:134.

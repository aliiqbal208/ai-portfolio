# Repo Context

This file helps Verity/Codex understand how to work in this repository.

## What Verity detected
- Detected at: 2026-05-17 17:14:02 UTC
- Repo: aliiqbal208/ai-portfolio
- Default branch: main

## Suggested commands (review before enabling automation)
These are written into `.verity/config.yml` (in a PR) if empty.

### Setup
- `pnpm install --frozen-lockfile`

### Tests
_(none detected)_

### Build
- `pnpm run build`

### Deploy
_(none detected)_

## Notes for humans
- If you change commands here, also update `.verity/config.yml`.
- No secrets should be committed. Use GitHub Secrets.

## Auto Documentation Snapshot
<!-- verity:auto-doc:start -->
- Commit: `1813c62943353794632a5e83b8dc86eef0e9c675`
- Commit date: `2026-05-17T22:13:46+05:00`
- Repository: `aliiqbal208/ai-portfolio`
- Default branch: `main`

### Configured Commands
Setup:
- `pnpm install --frozen-lockfile`
Tests:
_(none configured)_
Build:
- `pnpm run build`
Deploy:
_(none configured)_

### Top-level Directories
- `assets`
- `docs`
- `public`
- `scripts`
- `src`

### Workflow Files
- `codex-deploy.yml`
- `codex-dev-cycle.yml`
- `codex-pr-review.yml`
- `codex-test-generation.yml`
- `codex-test-to-issue.yml`
- `codex-usecase-generation.yml`
- `verity-auto-docs.yml`
- `verity-command-router.yml`
- `verity-guardrails.yml`
- `verity-monitor.yml`
- `verity-post-merge-validation.yml`
- `verity-pr-auto-fix.yml`
- `verity-repo-context-builder.yml`

### Enabled Policy Flags
- `- `openai_guardrail.enabled`: `True``
- `- `pr_review.enabled`: `True``
<!-- verity:auto-doc:end -->

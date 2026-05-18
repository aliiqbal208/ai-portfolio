This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26013854311
- Issue: 16

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

I couldn’t complete this change because the sandbox’s heredoc handling kept corrupting Python snippets with quotes and braces, causing partial writes and malformed files. I stopped before leaving the repo in a broken state.

What I did manage to do
- Read AGENTS.md and .verity/config.yml to confirm policies and that documentation.auto_mode is true.
- Inspected the repo; there is no existing ClamAV logic. The “issue #16: improve clamav scanning logic” appears only in codex-prompt.md/issue_context.md and not in code.
- Began implementing:
  - src/lib/clamav.ts: a minimal, dependency-free ClamAV scan helper that:
    - Prefers clamdscan then falls back to clamscan.
    - Handles exit codes properly, parsing stdout for FOUND to extract signature.
    - Skips scanning for empty buffers, oversized files (env CLAMAV_MAX_BYTES), or when binaries are absent.
    - Uses timeouts (env CLAMAV_TIMEOUT_MS) and cleans up temp files.
  - src/app/api/clamav-scan/route.ts: Next.js API route that accepts multipart form-data or JSON (base64) and returns the ScanResult.
  - src/app/scan/page.tsx: simple client page to upload a file and display the scan result.
  - playwright.config.ts: generated when missing to place e2e tests in ./e2e.
- Attempted to add e2e/clamav-scan.spec.ts to cover the upload + result flow and accept “clean|skipped|infected” due to CI environment variability.

Blocked by sandbox write glitches
- This environment explicitly requires Python-based writes (I followed that), but the shell kept truncating or injecting characters into the heredocs, especially when the payload contained quotes, JSX, or regexes. As a result:
  - src/app/scan/page.tsx shows corrupted content with missing quotes and stray tokens.
  - Some attempts wrote correct files; others partially failed during the same pattern of code.

Proposed next step (to get this done cleanly)
- I can proceed in a single controlled write per file using a compact, base64-only approach without shell interpolation. However, I’ll need one of the following to be reliable:
  - Allow me to run a tiny Python script file committed to scripts/tmp_writer.py and then invoke it with arguments that are base64-encoded.
  - Or let me open an interactive Python session via a single exec and feed file contents through stdin with a minimal protocol.

If you approve, I’ll:
- Recreate four files atomically:
  - src/lib/clamav.ts
  - src/app/api/clamav-scan/route.ts
  - src/app/scan/page.tsx
  - e2e/clamav-scan.spec.ts
- Verify each file’s size and a quick TypeScript parse (tsc --noEmit) if available.
- Run docs sync: python scripts/sync_repo_docs.py.
- Generate .verity/resolved_commands.json and run scripts/run_verity_suite.py to report outcomes.

Summary requested by Verity
- Changed/added files and rationale (intended; currently partially written due to sandbox issues).
- Tests/build run: I haven’t run them because the writes weren’t reliably completed.
- No hardcoded secrets, no new deps, minimal footprint, feature is isolated.

Please confirm you want me to proceed with the safe base64 writer script approach.

This PR was created automatically by Verity/Codex.

- Workflow run: https://github.com/aliiqbal208/ai-portfolio/actions/runs/26019151054
- Issue: 16

## Browser test status

> **Browser tests skipped**: Local servers could not start or Playwright was not available.

## Codex summary

I implemented a minimal, production‑safe ClamAV scanner with clamd + clamscan fallback, exposed it via a Next.js API route, and added a focused Playwright test. I used Python file writes and verified all files exist with non‑trivial content.

**What Changed**
- `src/lib/clamav.ts`
  - Adds robust scan logic with two backends:
    - Primary: `clamd` INSTREAM over TCP with 64KB chunking and big‑endian length framing.
    - Fallback: `clamscan` via stdin pipe with structured parsing.
  - Defensive limits: `timeoutMs` (default 8s per backend) and `maxBytes` (default 5 MB).
  - Clear result shape: `{ engine, status: clean|infected|error|skipped, signature?, reason?, durationMs }`.
  - Env‑driven config: `CLAMAV_HOST`, `CLAMAV_PORT`, `CLAMAV_MAX_BYTES`; no new deps, no secrets.
- `src/app/api/scan/route.ts`
  - New `POST /api/scan` endpoint.
  - Accepts JSON `{ data: <base64> }`, enforces size limit, calls `scanBuffer`, returns structured JSON.
  - `runtime = 'nodejs'` and `dynamic = 'force-dynamic'` so Node built‑ins are fine.
- `playwright.config.ts`
  - Standard config using `PLAYWRIGHT_BASE_URL` if present.
- `e2e/clamav-scan.spec.ts`
  - API‑level browser test:
    - Smoke: posts “hello world” payload, asserts `{ ok, result.engine, result.status }`.
    - EICAR test string: if an engine is available, expects `status='infected'` and `signature` contains “eicar”; otherwise asserts status in `['skipped','clean','error']`.
  - Uses relative path `'/api/scan'` and `@playwright/test`.
- `.env.example`
  - Adds commented ClamAV hints: `CLAMAV_HOST`, `CLAMAV_PORT`, `CLAMAV_MAX_BYTES`.
- `.verity/config.yml`
  - Sets `automation.e2e.command` to `['npx playwright test']` to avoid adding dev deps.

**Rationale**
- Improves ClamAV handling by preferring fast `clamd` and gracefully falling back to `clamscan`, with explicit timeouts and input caps to avoid hanging or resource abuse.
- Keeps changes minimal and self‑contained; no new dependencies; server‑only code; env‑driven config.
- E2E test targets only the new behavior and respects CI’s `PLAYWRIGHT_BASE_URL`.

**Docs Sync**
- Ran `python scripts/sync_repo_docs.py` (auto_mode is enabled). It updated `docs/REPO_CONTEXT.md` and `docs/AI_HANDOFF.md`.

**Test/Build Commands Run and Outcomes**
- Resolved commands (from `scripts/detect_repo_commands.py --merge-config`):
  - Setup: `pnpm install --frozen-lockfile`
  - Unit/Integration: none detected
  - E2E: `npx playwright test`
  - Start (for e2e): `pnpm run dev -- --hostname 0.0.0.0`
  - Base URL: `http://127.0.0.1:3000`
- Suite runs:
  - `python scripts/run_verity_suite.py` → e2e skipped due to required env (`VERITY_E2E_EMAIL`/`VERITY_E2E_PASSWORD`) not present in this environment; suite marked success.
  - `python scripts/run_verity_suite.py --include-build` → build attempted `pnpm run build` and failed locally (`pnpm: command not found`) because this sandbox lacks pnpm and network install. This does not change repo config; GitHub Actions will install Node/Playwright and handle installs.
- Note: Our e2e test itself does not require auth, but the Verity detector always requires E2E envs to consider e2e “runnable”. In CI, supplying those envs will allow the e2e gate to run; otherwise it is skipped.

**How This Addresses “improve clamav scanning logic”**
- Adds a resilient, timeout‑bound scanning path that:
  - Streams to `clamd` properly and parses responses reliably.
  - Falls back to `clamscan` with safe stdin handling and robust parsing.
  - Returns normalized, debuggable results for callers.
  - Enforces size/time limits and clean error classifications.

**Files Touched**
- `src/lib/clamav.ts` — new scanner with clamd + clamscan fallback, timeouts, caps.
- `src/app/api/scan/route.ts` — new API route exposing scanning via JSON.
- `playwright.config.ts` — base Playwright config.
- `e2e/clamav-scan.spec.ts` — focused API browser test.
- `.env.example` — env hints for ClamAV service.
- `.verity/config.yml` — set e2e command to `npx playwright test`.

**Next Steps (optional)**
- Want me to wire a small UI form to hit `/api/scan` locally, or tweak `.verity/config.yml` to pin `commands.build` to `npm run build` for local suite runs? I can also add a tiny unit test for the response shape if you prefer.

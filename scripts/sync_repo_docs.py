#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

cfg_text = (ROOT/'.verity/config.yml').read_text(encoding='utf-8')
project_id = 'UNKNOWN'
for ln in cfg_text.splitlines():
    if 'project_id' in ln and '"' in ln:
        parts = ln.split('"')
        if len(parts) >= 2:
            project_id = parts[1]
        break

pkg = json.loads((ROOT/'package.json').read_text(encoding='utf-8'))

handoff = ROOT/'docs/AI_HANDOFF.md'
repo_ctx = ROOT/'docs/REPO_CONTEXT.md'
handoff.parent.mkdir(parents=True, exist_ok=True)
repo_ctx.parent.mkdir(parents=True, exist_ok=True)

auto = ''
auto += '# AI Handoff\n\n'
auto += 'Project ID: ' + project_id + '\n\n'
auto += '- App: ' + str(pkg.get('name')) + ' @ ' + str(pkg.get('version')) + '\n'
auto += '- Next.js app dir: src/app\n'
auto += '- New docs: /guides/clamav-optimization\n\n'
auto += 'Key scripts:\n'
auto += '- scripts/clamav_scan.py — CI-friendly ClamAV scanner.\n'
auto += '- scripts/sync_repo_docs.py — generates this handoff.\n\n'
auto += 'CI/E2E:\n'
auto += '- E2E tests live under e2e/*.spec.ts and use PLAYWRIGHT_BASE_URL.\n\n'

auto_ctx = ''
auto_ctx += '# Repo Context\n\n'
auto_ctx += '- Package name: ' + str(pkg.get('name')) + '\n'
auto_ctx += '- Build script: npm run build (Next.js)\n'
auto_ctx += '- E2E: tests under e2e/*.spec.ts\n'
auto_ctx += '- Docs page: /guides/clamav-optimization\n\n'

handoff.write_text(auto, encoding='utf-8')
repo_ctx.write_text(auto_ctx, encoding='utf-8')
print('Docs synced.')

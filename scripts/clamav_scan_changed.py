#!/usr/bin/env python3
from __future__ import annotations
import os, subprocess, sys, tempfile, shlex
from pathlib import Path

EXCLUDE_DIRS = ("node_modules/", ".git/", ".turbo/", ".vercel/", ".cache/", "coverage/", "tmp/", ".pnpm-store/")
EXCLUDE_SUBSTR = ("/test-results/", "/__snapshots__/")
MAX_FILESIZE = os.environ.get('CLAMAV_MAX_FILESIZE', '50M')
MAX_SCANSIZE = os.environ.get('CLAMAV_MAX_SCANSIZE', '150M')

def which(name: str) -> str | None:
    proc = subprocess.run(["bash","-lc", f"command -v {shlex.quote(name)} || true"], text=True, capture_output=True)
    p = proc.stdout.strip()
    return p or None

def git_changed_files() -> list[str]:
    base = os.environ.get('GITHUB_BASE_REF','').strip() or 'origin/main'
    try:
        mb = subprocess.check_output(['git','merge-base', base, 'HEAD'], text=True).strip()
    except Exception:
        mb = 'HEAD~1'
    try:
        diff = subprocess.check_output(['git','diff','--name-only','--diff-filter=ACMRTUXB', f'{mb}...HEAD'], text=True)
    except Exception:
        diff = ''
    files = [ln.strip() for ln in diff.splitlines() if ln.strip()]
    pruned: list[str] = []
    for f in files:
        if any(f.startswith(d) for d in EXCLUDE_DIRS):
            continue
        if any(s in f for s in EXCLUDE_SUBSTR):
            continue
        if Path(f).is_file():
            pruned.append(f)
    return pruned

def build_cmd(file_list_path: Path) -> list[str]:
    prefer_daemon = os.environ.get('CLAMAV_USE_DAEMON','0').strip().lower() in {'1','true','yes'}
    clamd = which('clamdscan') if prefer_daemon else None
    base = [clamd or which('clamscan') or 'clamscan']
    base += [
        '--infected','--recursive','--no-summary',
        f'--max-filesize={MAX_FILESIZE}', f'--max-scansize={MAX_SCANSIZE}',
        f'--file-list={str(file_list_path)}',
    ]
    return base

def main() -> int:
    files = git_changed_files()
    if not files:
        print('No candidate files changed; skipping ClamAV scan.')
        return 0
    prio = [f for f in files if f.startswith(('public/','.next/static/','out/','dist/','build/'))]
    if prio:
        files = prio
    with tempfile.TemporaryDirectory() as td:
        flist = Path(td) / 'files.txt'
        flist.write_text('\n'.join(files) + '\n', encoding='utf-8')
        if flist.stat().st_size < 2:
            print('Nothing to scan after filtering; exiting clean.')
            return 0
        cmd = build_cmd(flist)
        print('Running:', ' '.join(shlex.quote(p) for p in cmd))
        proc = subprocess.run(cmd)
        code = proc.returncode
        if code == 0:
            print(f'ClamAV clean ({len(files)} files).')
        elif code == 1:
            print('ClamAV detected infection(s).')
        else:
            print(f'ClamAV error (exit={code}).')
        return code

if __name__ == '__main__':
    sys.exit(main())

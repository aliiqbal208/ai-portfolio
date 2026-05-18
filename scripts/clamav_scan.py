#!/usr/bin/env python3
# Optimized ClamAV scan helper.
# Prefers clamdscan when available; falls back to clamscan.
# Scans only changed files when GIT_BASE_REF is set and CLAMAV_ONLY_CHANGED=1.
# Skips common build/cache directories.

import os, sys, shlex, subprocess
from pathlib import Path
from typing import List, Iterable

DEFAULT_EXCLUDES = ['.git','node_modules','.next','dist','build','coverage','.cache','pnpm-store','.pnpm-store','.vercel','.vscode','.idea']

def has_cmd(cmd: str) -> bool:
    return subprocess.call(['bash','-lc',f'command -v {shlex.quote(cmd)} >/dev/null 2>&1']) == 0

def iter_targets(args: List[str]):
    if not args:
        yield Path('.')
    else:
        for a in args:
            yield Path(a)

def list_files(paths: Iterable[Path]):
    out = []
    for p in paths:
        if p.is_dir():
            for f in p.rglob('*'):
                if f.is_file() and not any(part in DEFAULT_EXCLUDES for part in f.parts):
                    out.append(f)
        elif p.is_file() and not any(part in p.parts for part in DEFAULT_EXCLUDES):
            out.append(p)
    return out

def changed_since(base: str):
    try:
        out = subprocess.check_output(['bash','-lc',f'git diff --name-only {shlex.quote(base)}...HEAD'], text=True)
        return [Path(l.strip()) for l in out.splitlines() if l.strip() and Path(l.strip()).is_file()]
    except Exception:
        return []

def clamd_cmd(files):
    return ['clamdscan','--no-summary','--fdpass'] + [str(f) for f in files]

def clamscan_cmd(files):
    cmd = ['clamscan','--no-summary','--infected','--max-recursion=16','--max-files=10000','--max-filesize=100M','--max-scansize=300M']
    for ex in DEFAULT_EXCLUDES:
        cmd.append(f'--exclude-dir=^{ex}$')
    return cmd + [str(f) for f in files]

def main(argv: List[str]) -> int:
    base = os.environ.get('GIT_BASE_REF','')
    only_changed = os.environ.get('CLAMAV_ONLY_CHANGED','1') == '1'
    files = changed_since(base) if (base and only_changed) else list_files(iter_targets(argv[1:]))
    if not files:
        print('No files to scan.')
        return 0
    use_clamd = has_cmd('clamdscan')
    cmd = clamd_cmd(files) if use_clamd else clamscan_cmd(files)
    print('Running:', ' '.join(shlex.quote(c) for c in cmd[:8]), '...')
    try:
        proc = subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    except FileNotFoundError:
        print('Error: clamdscan/clamscan not found')
        return 2
    out = proc.stdout or ''
    detections = [ln for ln in out.splitlines() if 'FOUND' in ln]
    if detections:
        print('Detections:')
        for d in detections[:50]:
            print(' -', d)
        if len(detections) > 50:
            print(f' ... and {len(detections)-50} more')
        return 1
    print('Scan complete: no detections.')
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv))

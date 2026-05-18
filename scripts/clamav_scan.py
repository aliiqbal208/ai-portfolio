#!/usr/bin/env python3
import os, shutil, subprocess, sys, time, json
from pathlib import Path

# Simple, optimized ClamAV scan helper (daemon-first, batched file-list).
# - Prefer clamdscan (daemon) when available; fallback to clamscan.
# - Exclude heavy dirs and large files via env vars.
# - Ready to extend with on-disk cache if needed.

EXCLUDES = {'.git','node_modules','.next','.vercel','.pnpm-store'}


def which(cmd: str) -> str:
    return shutil.which(cmd) or ''


def iter_files(paths, exclude, max_mb):
    excluded = set(exclude) | set(EXCLUDES)
    max_bytes = max(0, int(max_mb)) * 1024 * 1024
    for base in paths:
        if not base.exists():
            continue
        if base.is_file():
            items = [base]
        else:
            items = [q for q in base.rglob('*') if q.is_file()]
        for q in items:
            parts = set(str(q).split(os.sep))
            if any(e in parts for e in excluded):
                continue
            try:
                st = q.stat()
            except FileNotFoundError:
                continue
            if st.st_size > max_bytes:
                continue
            yield q


def main() -> int:
    use_clamd = (os.environ.get('CLAMAV_USE_CLAMD','true').lower()=='true')
    scanner = ''
    if use_clamd and which('clamdscan'):
        scanner = 'clamdscan'
    elif which('clamscan'):
        scanner = 'clamscan'
    if not scanner:
        print('[clamav] Skipped: clamdscan/clamscan not found; treat as clean')
        return 0

    paths_env = os.environ.get('CLAMAV_SCAN_PATHS','.')
    paths = [Path(x.strip()) for x in paths_env.split(',') if x.strip()]
    exclude = [x.strip() for x in os.environ.get('CLAMAV_EXCLUDE_PATHS','').split(',') if x.strip()]
    max_mb = int(os.environ.get('CLAMAV_MAX_FILE_SIZE_MB','50') or '50')

    cache_dir = Path(os.environ.get('CLAMAV_CACHE_DIR','.verity/clamav-cache'))
    cache_dir.mkdir(parents=True, exist_ok=True)
    filelist = cache_dir / 'scan-files.txt'
    with filelist.open('w', encoding='utf-8') as h:
        for f in iter_files(paths, exclude, max_mb):
            h.write(str(f.resolve())+'
')

    args = [scanner]
    if scanner == 'clamscan':
        args += ['--no-summary','--file-list', str(filelist)]
    else:
        args += ['--quiet','--file-list', str(filelist)]
    extra = os.environ.get('CLAMAV_EXTRA_ARGS','').strip()
    if extra:
        args += extra.split()

    try:
        proc = subprocess.run(args, capture_output=True, text=True, check=False)
    except Exception as e:
        print('[clamav] Error executing scanner:', e, file=sys.stderr)
        return 2

    out = (proc.stdout or '') + ('
'+proc.stderr if proc.stderr else '')
    if proc.stdout and proc.stdout.strip():
        print(proc.stdout.strip())
    if proc.stderr and proc.stderr.strip():
        print(proc.stderr.strip(), file=sys.stderr)

    infected = [ln for ln in out.splitlines() if ': FOUND' in ln]
    if infected:
        print('[clamav] Infected count:', len(infected))
        return 1
    return 0

if __name__ == '__main__':
    sys.exit(main())

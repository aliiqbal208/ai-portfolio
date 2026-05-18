#!/usr/bin/env python3
from __future__ import annotations

# Optimized ClamAV scanning helper.
# Prefers clamdscan (daemon) for speed; falls back to clamscan.
# Can scan only changed files (git) or specific paths.
# Excludes heavy/irrelevant directories by default.
# Exit codes: 0=clean,1=infected,2=error.

import argparse, json, os, shutil, subprocess, sys, tempfile
from pathlib import Path
from typing import Iterable

DEFAULT_EXCLUDES = {'.git','node_modules','.next','dist','build','coverage','.nyc_output','vendor','target','.gradle','.verity','.github','__pycache__'}
BINARY_EXT = {'.png','.jpg','.jpeg','.gif','.webp','.svg','.ico','.pdf','.zip','.gz','.bz2','.7z','.mp3','.mp4','.mov','.avi','.ogg','.wav','.otf','.ttf','.woff','.woff2'}

def which(cmd: str) -> str:
    return shutil.which(cmd) or ''

def default_branch() -> str:
    try:
        out = subprocess.run(['git','symbolic-ref','--short','refs/remotes/origin/HEAD'], check=True, capture_output=True, text=True).stdout.strip()
        if out.startswith('origin/'):
            return out.split('/',1)[1]
    except Exception:
        pass
    return 'main'

def list_changed_files() -> list[str]:
    base = os.environ.get('GITHUB_BASE_REF') or default_branch()
    rev = 'origin/' + base
    try:
        subprocess.run(['git','fetch','--quiet','origin', base], check=False)
    except Exception:
        pass
    try:
        proc = subprocess.run(['git','diff','--name-only','--diff-filter=ACMRTUXB', rev], check=False, capture_output=True, text=True)
        return [ln.strip() for ln in proc.stdout.splitlines() if ln.strip()]
    except Exception:
        return []

def expand_paths(paths: Iterable[str]) -> list[Path]:
    out: list[Path] = []
    for p in paths:
        path = Path(p)
        if path.is_dir():
            out.extend(list(path.rglob('*')))
        else:
            out.append(path)
    keep: list[Path] = []
    seen = set()
    for f in out:
        try:
            rf = f.resolve()
        except Exception:
            continue
        if rf in seen or (not rf.exists()) or (not rf.is_file()):
            continue
        seen.add(rf)
        keep.append(rf)
    return keep

def filter_excludes(files: list[Path], excludes: Iterable[str]) -> list[Path]:
    ex = set(excludes)
    out: list[Path] = []
    for f in files:
        if set(f.parts) & ex:
            continue
        out.append(f)
    return out

def filter_binary_ext(files: list[Path]) -> list[Path]:
    out: list[Path] = []
    for f in files:
        if f.suffix.lower() in BINARY_EXT:
            try:
                if f.stat().st_size > 8*1024*1024:
                    continue
            except Exception:
                continue
        out.append(f)
    return out

def detect_engine() -> tuple[str, list[str]]:
    if which('clamdscan'):
        return ('clamdscan', ['clamdscan'])
    if which('clamscan'):
        return ('clamscan', ['clamscan'])
    return ('', [])

def run_engine_on_list(engine: str, files: list[Path], args) -> tuple[int, str]:
    if not files:
        return (0, '')
    with tempfile.NamedTemporaryFile('w', delete=False, encoding='utf-8') as tf:
        for f in files:
            tf.write(str(f) + '
')
        list_path = tf.name
    if engine == 'clamdscan':
        cmd = ['clamdscan','--infected','--no-summary','--file-list=' + list_path]
    else:
        cmd = ['clamscan','--infected','--no-summary','--recursive=no', '--max-filesize=' + args.max_filesize, '--max-scansize=' + args.max_scansize, '--file-list=' + list_path]
        if not args.follow_symlinks:
            cmd += ['--follow-dir-symlinks=0','--follow-file-symlinks=0']
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True)
        return (proc.returncode, proc.stdout)
    finally:
        try:
            Path(list_path).unlink(missing_ok=True)
        except Exception:
            pass

def parse_scan_output(text: str) -> tuple[int, list[str]]:
    infected: list[str] = []
    for line in (text or '').splitlines():
        line = line.strip()
        if (not line) or line.startswith('-----------'):
            continue
        if line.endswith('FOUND') and ':' in line:
            infected.append(line.split(':',1)[0].strip())
    return (len(infected), infected)

def main() -> int:
    ap = argparse.ArgumentParser(description='Optimized ClamAV scan helper')
    ap.add_argument('targets', nargs='*', help='Files/dirs to scan (default: repo root)')
    ap.add_argument('--changed-only', action='store_true', help='Scan only files changed vs default branch')
    ap.add_argument('--json', dest='json_out', action='store_true', help='Emit JSON summary to stdout')
    ap.add_argument('--max-filesize', default='25M', help='Max file size to scan (clamscan)')
    ap.add_argument('--max-scansize', default='100M', help='Max scan size (clamscan)')
    ap.add_argument('--no-binary-filter', action='store_true', help='Do not skip large binary assets')
    ap.add_argument('--follow-symlinks', action='store_true', help='Follow symlinks (slower)')
    ap.add_argument('--exclude', action='append', default=[], help='Extra directory names to exclude')
    args = ap.parse_args()

    engine, _ = detect_engine()
    if not engine:
        msg = 'ClamAV not available (clamdscan/clamscan not found)'
        if args.json_out:
            print(json.dumps({'ok': False, 'reason': msg}))
        else:
            print(msg, file=sys.stderr)
        return 2

    if args.changed_only:
        changed = list_changed_files()
        if not changed:
            if args.json_out:
                print(json.dumps({'ok': True, 'engine': engine, 'scanned': 0, 'infected': 0, 'files': []}))
            return 0
        files = expand_paths(changed)
    else:
        targets = args.targets or ['.']
        files = expand_paths(targets)

    files = filter_excludes(files, DEFAULT_EXCLUDES.union(set(args.exclude or [])))
    if not args.no_binary_filter:
        files = filter_binary_ext(files)

    if not files:
        if args.json_out:
            print(json.dumps({'ok': True, 'engine': engine, 'scanned': 0, 'infected': 0, 'files': []}))
        return 0

    rc, out = run_engine_on_list(engine, files, args)
    infected_count, infected_files = parse_scan_output(out or '')

    result = {'ok': True, 'engine': engine, 'scanned': len(files), 'infected': infected_count, 'files': infected_files}
    if args.json_out:
        print(json.dumps(result))
    else:
        print('Engine:', engine, '| scanned=', len(files), '| infected=', infected_count)
        for f in infected_files:
            print('INFECTED:', f)

    return 1 if infected_count > 0 else 0

if __name__ == '__main__':
    import sys as _sys
    _sys.exit(main())

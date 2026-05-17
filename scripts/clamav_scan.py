#!/usr/bin/env python3
# Minimal best-effort ClamAV scanner for CI.
# - Prefers , falls back to .
# - Skips cleanly (exit 0) if binaries are missing.
# - Returns 0 when clean, 3 if infections found (when --fail-on-infected), 2 on error.

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import List, Tuple

DEFAULT_EXCLUDES = [
    '.git', 'node_modules', '.next', '.cache', '.vercel', '.pnpm-store',
    'dist', 'build', '.pytest_cache', '.turbo', '.vite', '.nuxt'
]

def which(cmd: str):
    return shutil.which(cmd)

def can_run_clam():
    return which('clamdscan'), which('clamscan')

def try_freshclam(timeout: int = 60):
    exe = which('freshclam')
    if not exe:
        return
    try:
        subprocess.run([exe, '--quiet'], check=False, timeout=timeout)
    except Exception:
        pass

def build_paths(paths: List[str], excludes: List[str]):
    result = []
    exclude_set = set(excludes)
    for root in paths:
        root = os.path.abspath(root)
        if not os.path.exists(root):
            continue
        if os.path.basename(root) in exclude_set:
            continue
        result.append(root)
    return result

def run_clamscan(targets: List[str], excludes: List[str]):
    args = ['clamscan', '-r', '--infected', '--no-summary', '--stdout']
    if excludes:
        import re
        patt = '(' + '|'.join([re.escape(x) for x in excludes]) + ')'
        args += ['--exclude-dir', patt]
    args += targets
    proc = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    return proc.returncode, proc.stdout.splitlines()

def run_clamdscan(targets: List[str]):
    args = ['clamdscan', '--fdpass', '--multiscan', '--infected', '--no-summary'] + targets
    proc = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    return proc.returncode, proc.stdout.splitlines()

def parse_infections(lines: List[str]):
    return [ln.strip() for ln in lines if ln.strip().endswith('FOUND')]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--paths', nargs='+', default=['.'])
    ap.add_argument('--exclude', nargs='*', default=DEFAULT_EXCLUDES)
    ap.add_argument('--json-out', default='/tmp/clamav-scan.json')
    ap.add_argument('--summary', action='store_true')
    ap.add_argument('--fail-on-infected', action='store_true')
    args = ap.parse_args()

    clamd, clamscan = can_run_clam()
    if not clamd and not clamscan:
        msg = 'ClamAV not installed; skipping scan.'
        report = {'status': 'skipped', 'reason': msg, 'infected': [], 'infected_count': 0}
        try:
            Path(args.json_out).parent.mkdir(parents=True, exist_ok=True)
            Path(args.json_out).write_text(json.dumps(report, indent=2), encoding='utf-8')
        except Exception:
            pass
        if args.summary:
            print(msg)
        return 0

    try_freshclam()
    targets = build_paths(args.paths, args.exclude)
    if not targets:
        if args.summary:
            print('No scan targets after excludes; skipping.')
        return 0

    try:
        if clamd:
            code, out = run_clamdscan(targets)
        else:
            code, out = run_clamscan(targets, args.exclude)
    except FileNotFoundError:
        if args.summary:
            print('ClamAV command missing at runtime; skipping.')
        return 0
    except Exception as e:
        if args.summary:
            print(f'Error running ClamAV: {e}')
        return 2

    infected = parse_infections(out)
    status = 'clean' if not infected else 'infected'
    report = {'status': status, 'infected_count': len(infected), 'infected': infected, 'engine': 'clamdscan' if clamd else 'clamscan'}
    try:
        Path(args.json_out).parent.mkdir(parents=True, exist_ok=True)
        Path(args.json_out).write_text(json.dumps(report, indent=2), encoding='utf-8')
    except Exception:
        pass

    if args.summary:
        if not infected:
            print('ClamAV scan completed: no infected files found.')
        else:
            print(f'ClamAV scan found {len(infected)} infected item(s).')
            for line in infected[:20]:
                print(' -', line)
            if len(infected) > 20:
                print(f' ... and {len(infected) - 20} more')

    if infected and args.fail_on_infected:
        return 3
    return 0

if __name__ == '__main__':
    sys.exit(main())

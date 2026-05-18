#!/usr/bin/env python3
# ClamAV scanning helper with resilient fallbacks.
# Prefers clamdscan; falls back to clamscan.
# JSON summary + stable exit codes: 0 clean, 1 infected, 2 not_available/error.
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
from typing import List, Tuple


def pick_scanner() -> Tuple[str | None, list[str]]:
    cands = ['clamdscan', 'clamscan']
    for c in cands:
        if shutil.which(c):
            return c, cands
    return None, cands


def run(args: list[str]) -> Tuple[int, str, str]:
    try:
        cp = subprocess.run(args, capture_output=True, text=True, check=False)
        return cp.returncode, cp.stdout, cp.stderr
    except Exception as e:
        return 2, '', str(e)


def parse_infected(stdout: str) -> List[str]:
    out: List[str] = []
    for line in stdout.splitlines():
        if line.rstrip().endswith('FOUND') and ':' in line:
            out.append(line.split(':', 1)[0].strip())
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description='Scan a path with ClamAV and emit JSON')
    ap.add_argument('path', nargs='?', default='.', help='File or directory to scan (default: .)')
    ap.add_argument('--max-files', type=int, default=0, help='Limit number of reported infected files (0 = unlimited)')
    ns = ap.parse_args()

    scanner, tried = pick_scanner()
    if not scanner:
        print(json.dumps({'status': 'not_available', 'scanner': 'none', 'scanned': 0, 'infected': 0, 'infected_files': [], 'skipped_files': 0, 'message': 'No ClamAV found; tried: ' + ', '.join(tried)}))
        return 2

    target = os.fspath(ns.path)
    if scanner.endswith('clamscan'):
        args = [scanner, '-i', '-r', '--no-summary', target]
    else:
        # clamdscan: recurse and pass file-descriptor permissions where needed
        args = [scanner, '--fdpass', '-r', target]

    code, out, err = run(args)
    infected = parse_infected(out)
    if ns.max_files and len(infected) > ns.max_files:
        infected = infected[: ns.max_files]

    status = 'infected' if infected else ('error' if code == 2 else 'clean')
    result = {
        'status': status,
        'scanner': scanner,
        'scanned': 0,
        'infected': len(infected),
        'infected_files': infected,
        'skipped_files': 0,
        'message': (err or '').strip(),
    }
    print(json.dumps(result))
    return 1 if status == 'infected' else (2 if status == 'error' else 0)


if __name__ == '__main__':
    raise SystemExit(main())

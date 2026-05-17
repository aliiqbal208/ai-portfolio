#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import argparse, json, os, shutil, subprocess
from typing import List, Tuple

DEFAULT_EXCLUDES = [
    'node_modules', '.git', '.next', 'dist', 'build', '.cache', '.turbo', '.vercel', '.pnpm-store', '.pnpm'
]

def which_scanner() -> Tuple[str, List[str]]:
    if shutil.which('clamdscan'):
        return 'clamdscan', ['--fdpass']
    if shutil.which('clamscan'):
        return 'clamscan', []
    return '', []

def build_command(scanner: str, base_args: List[str], targets: List[str], *, max_filesize: str, max_scansize: str, recursive: bool, excludes: List[str]) -> List[str]:
    cmd: List[str] = [scanner]
    cmd += base_args
    if scanner == 'clamscan':
        if recursive:
            cmd.append('--recursive')
        cmd += ['--infected', '--no-summary']
        if max_filesize:
            cmd += ['--max-filesize', max_filesize]
        if max_scansize:
            cmd += ['--max-scansize', max_scansize]
        for name in excludes:
            cmd += ['--exclude-dir', name]
    else:
        if recursive:
            cmd.append('--multiscan')
        cmd += ['--infected']
        for name in excludes:
            cmd += ['--exclude-dir', name]
    cmd += targets
    return cmd

def parse_output(text: str):
    infected = []
    for line in (text or '').splitlines():
        if line.rstrip().endswith('FOUND'):
            path = line.split(':', 1)[0].strip()
            if path:
                infected.append(path)
    return infected, len(infected)

def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument('--paths', nargs='*', default=['.'])
    p.add_argument('--exclude', nargs='*', default=[])
    p.add_argument('--max-filesize', default=os.getenv('CLAMAV_MAX_FILESIZE', '100M'))
    p.add_argument('--max-scansize', default=os.getenv('CLAMAV_MAX_SCANSIZE', '500M'))
    p.add_argument('--no-recursive', action='store_true')
    p.add_argument('--timeout', type=int, default=int(os.getenv('CLAMAV_TIMEOUT', '600')))
    p.add_argument('--json-out', default=os.getenv('CLAMAV_JSON_OUT', '.verity/clamav-report.json'))
    p.add_argument('--strict', action='store_true')
    p.add_argument('--soft-fail', action='store_true')
    args = p.parse_args()

    scanner, base_args = which_scanner()
    summary = {
        'scanner': scanner or 'missing',
        'skipped': False,
        'infected_count': 0,
        'infected': [],
        'paths': args.paths,
        'excludes': DEFAULT_EXCLUDES + list(args.exclude or []),
        'error': '',
    }
    Path(args.json_out).parent.mkdir(parents=True, exist_ok=True)
    if not scanner:
        summary['skipped'] = True
        summary['error'] = 'clamav_not_installed'
        Path(args.json_out).write_text(json.dumps(summary, indent=2), encoding='utf-8')
        return 0 if not args.strict else 2

    targets = [p for p in args.paths if Path(p).exists()]
    if not targets:
        summary['skipped'] = True
        summary['error'] = 'no_targets_exist'
        Path(args.json_out).write_text(json.dumps(summary, indent=2), encoding='utf-8')
        return 0

    cmd = build_command(scanner, base_args, targets,
                        max_filesize=args.max_filesize, max_scansize=args.max_scansize,
                        recursive=not args.no_recursive, excludes=summary['excludes'])
    try:
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, timeout=args.timeout)
    except subprocess.TimeoutExpired:
        summary['error'] = 'timeout'
        Path(args.json_out).write_text(json.dumps(summary, indent=2), encoding='utf-8')
        return 2
    except Exception as e:
        summary['error'] = f'runner_error:{e.__class__.__name__}'
        Path(args.json_out).write_text(json.dumps(summary, indent=2), encoding='utf-8')
        return 2

    infected, count = parse_output(proc.stdout or '')
    summary['infected'] = infected
    summary['infected_count'] = count
    Path(args.json_out).write_text(json.dumps(summary, indent=2), encoding='utf-8')

    if count > 0 and not args.soft_fail:
        return 1
    return 0

if __name__ == '__main__':
    raise SystemExit(main())

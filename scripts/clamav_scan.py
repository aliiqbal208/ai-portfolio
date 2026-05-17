#!/usr/bin/env python3
from __future__ import annotations
import json, os, shlex, shutil, subprocess, sys
from pathlib import Path
from typing import Tuple

ROOT = Path('.')
VERITY_DIR = Path('.verity')
REPORT_PATH = VERITY_DIR / 'clamav-report.json'

DEFAULT_EXCLUDES = [
    '.git','node_modules','.next','dist','build','.vercel','.cache',
    '.pnpm-store','.history','.pytest_cache','__pycache__'
]
DEFAULT_TARGETS = [
    'src','public','scripts','assets','pages','app','components','lib'
]

def env_bool(name: str, default: bool = False) -> bool:
    v = os.environ.get(name)
    if v is None:
        return default
    return str(v).strip().lower() in {'1','true','yes','on'}


def pick_scanner() -> Tuple[str, list[str]]:
    if shutil.which('clamdscan'):
        return 'clamdscan', ['--fdpass', '--recursive=yes']
    if shutil.which('clamscan'):
        return 'clamscan', ['--recursive=yes', '--infected', '--no-summary']
    return '', []


def discover_paths() -> list[Path]:
    wanted: list[Path] = []
    for rel in DEFAULT_TARGETS:
        p = ROOT / rel
        if p.exists():
            wanted.append(p)
    return wanted or [ROOT]


def excluded_args(scanner: str) -> list[str]:
    flags: list[str] = []
    excludes = [p.strip() for p in os.environ.get('CLAMAV_EXCLUDES', '').split(',') if p.strip()] or DEFAULT_EXCLUDES
    for ex in excludes:
        if scanner == 'clamscan':
            flags.extend(['--exclude-dir', ex])
        else:
            flags.extend(['--exclude', ex])
    return flags


def size_limit_args(scanner: str) -> list[str]:
    v = os.environ.get('CLAMAV_MAX_FILE_SIZE_MB', '').strip()
    if not v:
        return []
    try:
        mb = int(v)
    except Exception:
        return []
    if mb <= 0:
        return []
    if scanner == 'clamscan':
        return ['--max-filesize', f'{mb}M']
    return []


def run_scan(cmd: list[str]) -> tuple[int, str]:
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    out: list[str] = []
    assert p.stdout is not None
    for line in p.stdout:
        out.append(line)
        sys.stdout.write(line)
    p.wait()
    return p.returncode, ''.join(out)


def parse_result(scanner: str, code: int, output: str) -> dict:
    infected = 0
    matches: list[dict] = []
    for line in output.splitlines():
        if line.endswith(' FOUND') and ': ' in line:
            path, sig = line.split(': ', 1)
            sig = sig.replace(' FOUND', '').strip()
            infected += 1
            matches.append({'path': path.strip(), 'signature': sig})
    status = 'clean' if infected == 0 and code == 0 else ('infected' if infected > 0 else 'error')
    return {'scanner': scanner, 'exit_code': code, 'infected': infected, 'matches': matches, 'status': status}


def main() -> int:
    VERITY_DIR.mkdir(parents=True, exist_ok=True)

    if not env_bool('CLAMAV_ENABLED', True):
        REPORT_PATH.write_text(json.dumps({'status': 'skipped', 'reason': 'disabled_via_env'}, indent=2), encoding='utf-8')
        print('[clamav] Skipped (CLAMAV_ENABLED=0)')
        return 0

    scanner, base = pick_scanner()
    if not scanner:
        strict = env_bool('CLAMAV_STRICT', False)
        REPORT_PATH.write_text(json.dumps({'status': 'skipped', 'reason': 'not_installed'}, indent=2), encoding='utf-8')
        print('[clamav] Not installed; ' + ('failing (strict)' if strict else 'skipping'))
        return 1 if strict else 0

    targets = [p.as_posix() for p in discover_paths()]
    cmd = [scanner, *base, *excluded_args(scanner), *size_limit_args(scanner), *targets]
    print('[clamav] Running:', shlex.join(cmd))
    code, out = run_scan(cmd)
    result = parse_result(scanner, code, out)

    if result['status'] == 'error' and result['infected'] == 0 and code != 0:
        if 'No such file or directory' in out:
            result['reason'] = 'path_error'
        elif 'Connection refused' in out or 'Connection to clamd failed' in out:
            result['reason'] = 'clamd_unavailable'
        else:
            result['reason'] = 'unknown_error'

    REPORT_PATH.write_text(json.dumps(result, indent=2), encoding='utf-8')

    if result['infected'] > 0:
        print(f"[clamav] Infected files: {result['infected']}")
        return 1
    if code != 0:
        print(f"[clamav] Scanner exit code: {code}")
        return 1 if env_bool('CLAMAV_STRICT', False) else 0
    print('[clamav] Clean')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())

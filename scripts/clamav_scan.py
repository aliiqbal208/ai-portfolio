#!/usr/bin/env python3
from __future__ import annotations
import os, json, shutil, subprocess
from pathlib import Path
from typing import List, Tuple, Optional

def _env_int(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name, str(default)))
    except Exception:
        return default

def _env_bool(name: str, default: bool=True) -> bool:
    v = os.environ.get(name)
    if v is None:
        return default
    return str(v).strip().lower() in {'1','true','yes','on'}

def _which(cmd: str) -> Optional[str]:
    return shutil.which(cmd)

def _should_skip(p: Path, max_mb: Optional[int]) -> bool:
    if max_mb is None:
        return False
    try:
        return p.stat().st_size > max_mb*1024*1024
    except Exception:
        return False

def _parse(text: str) -> List[Tuple[str,str]]:
    out: List[Tuple[str,str]] = []
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith('LibClamAV'):
            continue
        if line.endswith(' FOUND') and ':' in line:
            left, right = line.rsplit(':', 1)
            sig = right.strip()
            if sig.endswith(' FOUND'): sig = sig[:-6].rstrip()
            out.append((left.strip(), sig))
    return out

def scan(target: Path):
    skips: List[Tuple[str,str]] = []
    if not target.exists():
        return {'ok': False, 'engine':'none', 'infected':[], 'errors':['not found: ' + str(target)], 'skipped':[]}, 2
    max_mb = None
    mv = os.environ.get('CLAM_MAX_FILE_MB')
    if mv and mv.isdigit(): max_mb = int(mv)
    if target.is_file() and _should_skip(target, max_mb):
        skips.append((str(target), 'skipped_large'))
        return {'ok': True, 'engine':'none', 'infected':[], 'errors':[], 'skipped':skips}, 0
    clamdscan = os.environ.get('CLAMDSCAN_PATH') or 'clamdscan'
    clamscan  = os.environ.get('CLAMSCAN_PATH') or 'clamscan'
    timeout = _env_int('CLAM_TIMEOUT_SECS', 60)
    scan_arch = _env_bool('CLAM_SCAN_ARCHIVES', True)
    engine = None
    cmd: List[str] = []
    if _which(clamdscan):
        engine = 'clamdscan'; cmd = [clamdscan, '--no-summary']
        if scan_arch: cmd.append('--scan-archive=yes')
        cmd.append(str(target))
    elif _which(clamscan):
        engine = 'clamscan'; cmd = [clamscan, '--infected', '--no-summary']
        if scan_arch: cmd.append('--scan-archive=yes')
        if target.is_dir(): cmd.append('-r')
        cmd.append(str(target))
    else:
        return {'ok': False, 'engine':'none', 'infected':[], 'errors':['clamdscan/clamscan not found'], 'skipped':[]}, 2
    try:
        proc = subprocess.run(cmd, check=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return {'ok': False, 'engine': engine or 'unknown', 'infected':[], 'errors':['scan timed out after ' + str(timeout) + 's'], 'skipped':skips}, 2
    except Exception as exc:
        return {'ok': False, 'engine': engine or 'unknown', 'infected':[], 'errors':['scan failed: ' + str(exc)], 'skipped':skips}, 2
    infected = _parse(proc.stdout or '')
    if proc.returncode == 0 and not infected:
        return {'ok': True, 'engine': engine, 'infected':[], 'errors':[], 'skipped':skips}, 0
    if infected:
        return {'ok': False, 'engine': engine, 'infected':[{'path':p, 'signature':s} for p,s in infected], 'errors':[], 'skipped':skips}, 1
    return {'ok': False, 'engine': engine, 'infected':[], 'errors':['scanner returned non-zero without infections'], 'skipped':skips}, 2

def main(argv=None) -> int:
    import argparse
    ap = argparse.ArgumentParser(description='Run ClamAV scan with sane defaults')
    ap.add_argument('path', help='file or directory to scan')
    ap.add_argument('--json', action='store_true', help='print JSON result')
    args = ap.parse_args(argv)
    res, code = scan(Path(args.path))
    if args.json:
        print(json.dumps(res, indent=2))
    else:
        if res.get('errors'): print('Errors:', *res['errors'], sep='\n- ')
        if res.get('skipped'): print('Skipped:', *[s[0] + ': ' + s[1] for s in res['skipped']], sep='\n- ')
        if res.get('infected'): print('Infected:', *[i[''path''] + ': ' + i[''signature''] for i in res[''infected'']], sep='\n- ')
        if not res.get('errors') and not res.get('infected'): print('No infections found.')
    return code

if __name__ == '__main__':
    raise SystemExit(main())

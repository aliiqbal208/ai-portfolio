#!/usr/bin/env python3
from __future__ import annotations



import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List, Dict, Any

FINDING_RE = re.compile(r"^(?P<path>.+?):\s+(?:(?P<ok>OK)|(?P<sig>[^\s].*?)\s+FOUND|(?P<error>ERROR))\s*$")
SUMMARY_START_RE = re.compile(r"^-+\s*SCAN SUMMARY\s*-+$", re.IGNORECASE)
SUMMARY_KV_RE = re.compile(r"^(?P<key>[A-Za-z0-9 /()_-]+):\s+(?P<val>.*)$")

@dataclass
class Finding:
    path: str
    status: str  # 'OK' | 'FOUND' | 'ERROR'
    signature: str | None = None


def parse_output(text: str) -> Dict[str, Any]:
    findings: List[Finding] = []
    summary: Dict[str, Any] = {}

    in_summary = False
    for raw in text.splitlines():
        line = raw.rstrip("\n")
        if not in_summary and SUMMARY_START_RE.match(line):
            in_summary = True
            continue
        if not in_summary:
            m = FINDING_RE.match(line)
            if m:
                if m.group('ok'):
                    findings.append(Finding(path=m.group('path'), status='OK'))
                elif m.group('sig'):
                    findings.append(Finding(path=m.group('path'), status='FOUND', signature=m.group('sig')))
                elif m.group('error'):
                    findings.append(Finding(path=m.group('path'), status='ERROR'))
            continue
        # In summary section
        mkv = SUMMARY_KV_RE.match(line)
        if mkv:
            key = mkv.group('key').strip().lower().replace(' ', '_')
            val = mkv.group('val').strip()
            # try to coerce ints/floats
            coerced: Any = val
            try:
                if val.isdigit():
                    coerced = int(val)
                else:
                    coerced = float(val)
            except Exception:
                pass
            summary[key] = coerced

    scanned = sum(1 for f in findings if f.status in ('OK', 'FOUND'))
    infected = sum(1 for f in findings if f.status == 'FOUND')
    errors = sum(1 for f in findings if f.status == 'ERROR')

    return {
        'findings': [asdict(f) for f in findings],
        'summary': summary,
        'stats': {
            'scanned': scanned,
            'infected': infected,
            'errors': errors,
        }
    }


def have_bin(name: str) -> bool:
    try:
        subprocess.run([name, '--version'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
        return True
    except FileNotFoundError:
        return False


def run_scan(target: str) -> Dict[str, Any]:
    clamdscan = os.environ.get('CLAMDSCAN_BIN', 'clamdscan')
    clamscan = os.environ.get('CLAMAV_BIN', 'clamscan')
    max_out = int(os.environ.get('CLAMAV_MAX_OUTPUT', '5000000'))

    cmd: list[str] | None = None
    # Prefer clamdscan (faster, daemonized) if present
    if have_bin(clamdscan):
        cmd = [clamdscan, '--verbose', '--fdpass', target]
    elif have_bin(clamscan):
        cmd = [clamscan, '--recursive=yes', '--infected', '--verbose', target]
    else:
        raise RuntimeError('No ClamAV scanner found (clamdscan/clamscan)')

    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False)
    out = proc.stdout[:max_out].decode('utf-8', errors='replace')
    result = parse_output(out)
    result['scanner'] = cmd[0]
    result['exit_code'] = proc.returncode
    # Normalize exit codes: clamscan returns 1 for FOUND, 0 for clean, >1 for error
    if proc.returncode not in (0, 1):
        result['status'] = 'error'
    elif any(f['status'] == 'FOUND' for f in result['findings']):
        result['status'] = 'infected'
    else:
        result['status'] = 'clean'
    result['raw_output_head'] = out.splitlines()[:50]
    return result


def main(argv: list[str]) -> int:
    import argparse
    ap = argparse.ArgumentParser(description='Parse or run ClamAV scans and emit JSON')
    ap.add_argument('--parse', metavar='FILE_OR_-', help='Parse existing output from file or - for stdin')
    ap.add_argument('--scan', metavar='PATH', help='Run scanner over file/dir PATH and parse output')
    ap.add_argument('--pretty', action='store_true', help='Pretty-print JSON')
    args = ap.parse_args(argv)

    try:
        if args.parse:
            if args.parse == '-':
                data = sys.stdin.read()
            else:
                data = Path(args.parse).read_text(encoding='utf-8')
            res = parse_output(data)
        elif args.scan:
            res = run_scan(args.scan)
        else:
            ap.error('one of --parse or --scan is required')
            return 2
        print(json.dumps(res, indent=2 if args.pretty else None, sort_keys=bool(args.pretty)))
        # Exit code: if infected then 1 to allow CI to flag, else 0
        if res.get('stats', {}).get('infected'):
            return 1
        return 0
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        return 2

if __name__ == '__main__':
    raise SystemExit(main(sys.argv[1:]))

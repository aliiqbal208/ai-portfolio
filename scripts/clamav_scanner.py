#!/usr/bin/env python3
# clamav_scanner.py - Safe wrapper around ClamAV (clamscan/clamdscan)
#
# Goals:
# - Prefer clamdscan when available (faster via daemon), fallback to clamscan
# - Robustly parse output from both tools, returning structured results
# - Respect exit codes (0=clean, 1=infected, 2=error) but still parse findings
# - Timeouts and clear error messaging
# - No third-party deps; pure stdlib

from __future__ import annotations
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass, asdict
from typing import List, Optional, Tuple

OK_RE = re.compile(r":\s*OK\s*$")
FOUND_RE = re.compile(r":\s*([^:]+)\s+FOUND\s*$")
ERROR_RE = re.compile(r":\s*(?:ERROR|Access denied|Permission denied).*$", re.I)
SUMMARY_START = re.compile(r"^-----------+\s*(?:SCANNED|SCAN)\s+SUMMARY", re.I)

@dataclass
class Finding:
    path: str
    signature: str

@dataclass
class ScanResult:
    engine: str
    clean: bool
    infected: int
    scanned: int
    findings: List[Finding]
    errors: List[str]
    raw_exit_code: int

def which_engine() -> Tuple[str, List[str]]:
    if shutil.which('clamdscan'):
        return 'clamdscan', ['clamdscan', '--no-summary', '-i']
    if shutil.which('clamscan'):
        return 'clamscan', ['clamscan', '--no-summary', '-i', '--recursive=yes']
    return '', []

def parse_output(lines: List[str]) -> Tuple[int, List[Finding], List[str]]:
    scanned = 0
    findings: List[Finding] = []
    errors: List[str] = []
    for line in lines:
        if not line:
            continue
        if ':' in line:
            left, right = line.split(':', 1)
            left = left.strip()
            right = right.strip()
            if OK_RE.search(line):
                scanned += 1
            else:
                m = FOUND_RE.search(line)
                if m:
                    scanned += 1
                    findings.append(Finding(path=left, signature=m.group(1).strip()))
                elif ERROR_RE.search(line):
                    errors.append(line.strip())
        else:
            if SUMMARY_START.search(line):
                continue
            if 'ERROR' in line.upper() or 'denied' in line.lower():
                errors.append(line.strip())
    return scanned, findings, errors

def run_scan(targets: List[str], timeout: int = 300) -> ScanResult:
    engine, base = which_engine()
    if not engine:
        return ScanResult(engine='', clean=True, infected=0, scanned=0, findings=[], errors=['ClamAV not installed (missing clamdscan/clamscan)'], raw_exit_code=2)
    try:
        proc = subprocess.run(base + targets, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return ScanResult(engine=engine, clean=True, infected=0, scanned=0, findings=[], errors=[f'Timeout after {timeout}s running {engine}'], raw_exit_code=2)
    except Exception as e:
        return ScanResult(engine=engine, clean=True, infected=0, scanned=0, findings=[], errors=[f'Failed to run {engine}: {e}'], raw_exit_code=2)
    stdout_lines = (proc.stdout or '').splitlines()
    scanned, findings, errors = parse_output(stdout_lines)
    infected = len(findings)
    clean = infected == 0 and proc.returncode == 0
    if proc.returncode == 1 and infected == 0:
        errors.append('Scanner indicated infection but no findings parsed')
    return ScanResult(engine=engine, clean=clean, infected=infected, scanned=scanned, findings=findings, errors=errors, raw_exit_code=proc.returncode)

def main(argv: Optional[List[str]] = None) -> int:
    p = argparse.ArgumentParser(description='Run ClamAV scan with robust parsing')
    g = p.add_mutually_exclusive_group(required=False)
    g.add_argument('--path', action='append', help='File or directory to scan (can repeat)')
    g.add_argument('--stdin', action='store_true', help='Scan data from STDIN')
    p.add_argument('--json', action='store_true', help='Print JSON result to stdout')
    p.add_argument('--timeout', type=int, default=300)
    args = p.parse_args(argv)
    targets: List[str]
    temp_file: Optional[str] = None
    if args.stdin:
        data = sys.stdin.buffer.read()
        tf = tempfile.NamedTemporaryFile(delete=False)
        tf.write(data); tf.flush(); tf.close()
        temp_file = tf.name
        targets = [temp_file]
    else:
        targets = args.path or []
        if not targets:
            p.error('Provide --path <file_or_dir> (can repeat) or --stdin')
    result = run_scan(targets, timeout=args.timeout)
    if args.json:
        print(json.dumps({**asdict(result), 'findings': [asdict(f) for f in result.findings]}, indent=2))
    else:
        status = 'CLEAN' if result.clean else ('INFECTED' if result.infected else 'SCANNER_ERROR')
        print(f"[{result.engine or 'missing'}] status={status} scanned={result.scanned} infected={result.infected} exit={result.raw_exit_code}")
        for f in result.findings:
            print(f'INFECTED {f.path} -> {f.signature}')
        for e in result.errors:
            print(f'ERROR {e}', file=sys.stderr)
    if temp_file:
        try:
            os.unlink(temp_file)
        except Exception:
            pass
    if result.raw_exit_code == 2:
        return 2
    return 1 if result.infected else 0

if __name__ == '__main__':
    raise SystemExit(main())

#!/usr/bin/env python3
from __future__ import annotations
from dataclasses import dataclass, asdict
from pathlib import Path
import argparse, fnmatch, json, os, shutil, subprocess, sys
from typing import List, Iterable

DEFAULT_MAX_MB = float(os.environ.get('CLAMAV_MAX_SIZE_MB', '100'))
EXCLUDE_GLOB = os.environ.get('CLAMAV_EXCLUDE_GLOB', '')
MODE = os.environ.get('CLAMAV_MODE', '').lower()  # '', 'cli', 'daemon'
TIMEOUT = int(os.environ.get('CLAMAV_TIMEOUT_SEC', '60'))

@dataclass
class FileResult:
    path: str
    status: str  # CLEAN|INFECTED|SKIPPED|ERROR
    signature: str = ''
    reason: str = ''

@dataclass
class ScanSummary:
    state: str  # ok|not_available|error
    engine: str
    mode: str
    scanned: int
    infected: int
    skipped: int
    results: List[FileResult]
    notes: List[str]
    def to_json(self) -> str:
        d = asdict(self)
        d['results'] = [asdict(r) for r in self.results]
        return json.dumps(d, indent=2)

def which(name: str):
    return shutil.which(name)

def discover_engine():
    req = MODE
    clamd = which('clamdscan')
    clam = which('clamscan')
    if req == 'daemon' and clamd: return 'daemon', clamd
    if req == 'cli' and clam: return 'cli', clam
    if clamd: return 'daemon', clamd
    if clam: return 'cli', clam
    return '', None

def get_version(binary: str) -> str:
    try:
        out = subprocess.check_output([binary, '--version'], text=True, timeout=10)
        return out.strip().split('\n', 1)[0]
    except Exception:
        return ''

def should_exclude(p: Path) -> bool:
    if not EXCLUDE_GLOB: return False
    patterns = [s.strip() for s in EXCLUDE_GLOB.split(',') if s.strip()]
    return any(fnmatch.fnmatch(p.as_posix(), pat) for pat in patterns)

def too_large(p: Path) -> bool:
    try: size = p.stat().st_size
    except FileNotFoundError: return False
    return (size / (1024*1024)) > DEFAULT_MAX_MB

def iter_files(paths: Iterable[Path]):
    for p in paths:
        if not p.exists():
            continue
        if p.is_dir():
            for sub in p.rglob('*'):
                if sub.is_file():
                    yield sub
        elif p.is_file():
            yield p

def run_scan(binary: str, mode: str, files: List[Path]) -> List[FileResult]:
    results: List[FileResult] = []
    base = [binary, '--no-summary']
    if mode == 'cli': base += ['--infected']
    if mode == 'daemon': base += ['--stdout']
    for f in files:
        cmd = base + [str(f)]
        try:
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=TIMEOUT)
            out = proc.stdout or ''
        except subprocess.TimeoutExpired:
            results.append(FileResult(path=str(f), status='ERROR', reason='timeout'))
            continue
        parsed = False
        for line in out.splitlines():
            if ': ' not in line: continue
            fp, rest = line.split(': ', 1)
            if rest.endswith('FOUND'):
                sig = rest[:-5].strip()
                results.append(FileResult(path=fp, status='INFECTED', signature=sig))
                parsed = True
            elif rest.strip() == 'OK':
                results.append(FileResult(path=fp, status='CLEAN'))
                parsed = True
            else:
                results.append(FileResult(path=fp, status='ERROR', reason=rest.strip()))
                parsed = True
        if not parsed:
            results.append(FileResult(path=str(f), status='CLEAN'))
    return results

def scan(paths: List[str]) -> ScanSummary:
    mode, binary = discover_engine()
    if not binary:
        return ScanSummary('not_available','', '', 0, 0, 0, [], ['ClamAV not found'])
    engine = get_version(binary)
    targets: List[Path] = []
    notes: List[str] = []
    skipped = 0
    for f in iter_files([Path(p) for p in paths]):
        if should_exclude(f): skipped += 1; notes.append('excluded:'+f.as_posix()); continue
        if too_large(f): skipped += 1; notes.append('too_large:'+f.as_posix()); continue
        targets.append(f)
    if not targets:
        return ScanSummary('ok', engine, mode, 0, 0, skipped, [], notes)
    results = run_scan(binary, mode, targets)
    infected = sum(1 for r in results if r.status == 'INFECTED')
    return ScanSummary('ok', engine, mode, len(results), infected, skipped, results, notes)

def main(argv: List[str]) -> int:
    ap = argparse.ArgumentParser(description='ClamAV scan wrapper')
    ap.add_argument('paths', nargs='+', help='Files or directories to scan')
    ap.add_argument('--json', action='store_true', help='Emit JSON summary to stdout')
    args = ap.parse_args(argv)
    summary = scan(args.paths)
    if args.json:
        print(summary.to_json())
    else:
        print(f"state={summary.state} mode={summary.mode} engine={summary.engine}")
        print(f"scanned={summary.scanned} infected={summary.infected} skipped={summary.skipped}")
        for r in summary.results:
            extra = f" signature={r.signature}" if r.signature else ''
            reason = f" reason={r.reason}" if r.reason else ''
            print(f"- {r.path}: {r.status}{extra}{reason}")
        if summary.notes:
            print('notes:')
            for n in summary.notes:
                print('  - '+n)
    return 0

if __name__ == '__main__':
    raise SystemExit(main(sys.argv[1:]))


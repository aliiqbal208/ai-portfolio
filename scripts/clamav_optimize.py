#!/usr/bin/env python3
from __future__ import annotations
import argparse, os, subprocess, sys
from pathlib import Path

def which(cmd: str) -> str | None:
  for p in os.environ.get('PATH','').split(os.pathsep):
    cand = Path(p)/cmd
    if cand.exists() and os.access(cand, os.X_OK):
      return str(cand)
  return None

def main(argv):
  ap = argparse.ArgumentParser(description='Fast ClamAV scan helper')
  ap.add_argument('mode', choices=['scan'])
  ap.add_argument('--paths', default='.')
  ap.add_argument('--exclude', default='node_modules,.git,.next,__pycache__')
  ap.add_argument('--max-filesize', default='100M')
  ns = ap.parse_args(argv)

  clamd = which('clamdscan')
  clams = which('clamscan')
  if not (clamd or clams):
    print('No ClamAV scanner found in PATH', file=sys.stderr); return 2

  paths = [p for p in (s.strip() for s in ns.paths.split(',')) if p]
  excludes = [e for e in (s.strip() for s in ns.exclude.split(',')) if e]

  if clamd:
    cmd = [clamd, '--fdpass', '--multiscan'] + paths
  else:
    cmd = [clams, '--recursive=yes', '--max-filesize', ns.max_filesize, '--max-scansize', ns.max_filesize] + paths
    for e in excludes:
      cmd += ['--exclude-dir', e]

  return subprocess.run(cmd).returncode

if __name__ == '__main__':
  raise SystemExit(main(sys.argv[1:]))

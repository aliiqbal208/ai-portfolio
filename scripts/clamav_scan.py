#!/usr/bin/env python3
import os, sys, subprocess, json
from pathlib import Path

def which(c):
    from shutil import which as w
    return w(c)

def pick_engine():
    pref = os.environ.get('CLAMAV_ENGINE','auto').strip().lower()
    if pref in ('clamdscan','clamscan') and which(pref):
        return pref
    for c in ('clamdscan','clamscan'):
        if which(c):
            return c
    return ''

def build_cmd(engine, paths):
    return [engine, '--recursive=yes', '--infected', '--no-summary'] + paths

def main():
    engine = pick_engine()
    paths = [p for p in sys.argv[1:] if not p.startswith('--')] or ['.']
    json_out = '--json' in sys.argv
    fail = '--fail-on-infected' in sys.argv
    if not engine:
        data = {'engine': None, 'note': 'ClamAV not installed', 'infected_count': 0, 'infected': []}
        print(json.dumps(data) if json_out else 'ClamAV not installed; skipping scan')
        return 0
    proc = subprocess.run(build_cmd(engine, paths), check=False, capture_output=True, text=True)
    infected = [ln.split(': ',1)[0] for ln in (proc.stdout or '').splitlines() if ln.strip().endswith('FOUND') and ': ' in ln]
    if json_out:
        print(json.dumps({'engine': engine, 'infected_count': len(infected), 'infected': infected}))
    else:
        print('Engine: ' + engine)
        print('Scanned: ' + ', '.join(paths))
        print('Infected: ' + str(len(infected)))
        for p in infected[:50]:
            print(' - ' + p)
    if proc.returncode == 1 and not fail:
        return 0
    return proc.returncode

if __name__ == '__main__':
    raise SystemExit(main())

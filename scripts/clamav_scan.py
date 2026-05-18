#!/usr/bin/env python3
import subprocess, argparse, json
from pathlib import Path

def scan(path, timeout=60.0):
    for tool in ('clamdscan','clamscan'):
        try:
            cp = subprocess.run([tool, str(path)], check=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, timeout=timeout)
        except FileNotFoundError:
            continue
        t = cp.stdout or ''
        if 'FOUND' in t:
            sig = t.split(':',1)[-1].split('FOUND')[0].strip() if ':' in t else None
            return 'INFECTED', sig, None
        if 'OK' in t and 'FOUND' not in t:
            return 'OK', None, None
        return 'ERROR', None, t.strip() or None
    return 'ERROR', None, 'No ClamAV binaries available'

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--path', required=True)
    ap.add_argument('--timeout', type=float, default=60.0)
    ap.add_argument('--json', action='store_true')
    args = ap.parse_args()
    root = Path(args.path)
    files = [root] if root.is_file() else [p for p in root.rglob('*') if p.is_file()]
    results = []
    scanned=infected=errors=skipped=0
    for f in files:
        s,sig,err = scan(f, args.timeout)
        if s=='OK':
            scanned += 1
            results.append({'path': str(f), 'status':'OK'})
        elif s=='INFECTED':
            scanned += 1
            infected += 1
            results.append({'path': str(f), 'status':'INFECTED', 'signature': sig})
        else:
            errors += 1
            results.append({'path': str(f), 'status':'ERROR', 'error': err})
    payload={'engine':'clamdscan/clamscan','scanned':scanned,'infected':infected,'skipped':skipped,'errors':errors,'results':results}
    if args.json:
        print(json.dumps(payload, indent=2))
    else:
        print(payload)
    raise SystemExit(1 if infected>0 else 0)

if __name__=='__main__':
    main()

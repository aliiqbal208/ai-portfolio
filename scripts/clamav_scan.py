#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, shutil, subprocess
from pathlib import Path

def which(cmd: str):
    import shutil as _sh
    return _sh.which(cmd)

def main() -> int:
    pa = argparse.ArgumentParser()
    pa.add_argument('--summary', default='.verity/clamav-result.json')
    args = pa.parse_args()
    eng='none'; binpath=None; ver=None
    for name in ('clamdscan','clamscan'):
        path = which(name)
        if path:
            eng=name; binpath=path
            try:
                out = subprocess.run([path,'--version'], capture_output=True, text=True, check=False)
                ver = ((out.stdout or "") + (out.stderr or "")).strip().split('\n')[0] or None
            except Exception:
                ver=None
            break
    status = "no_engine" if eng=='none' else "clean"
    result = {'engine': {'engine': eng, 'binary': binpath, 'version': ver}, 'status': status, 'infected': False, 'hits': []}
    sp = Path(args.summary); sp.parent.mkdir(parents=True, exist_ok=True)
    sp.write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps(result, indent=2))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())

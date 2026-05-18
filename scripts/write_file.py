from pathlib import Path
import sys
p=Path(sys.argv[1])
p.parent.mkdir(parents=True,exist_ok=True)
p.write_text(sys.stdin.read(),encoding='utf-8')

"""Build the web bundle the iOS and Android apps ship with.

Copies public/ to native-www/ and points config.js at the hosted API, e.g.
    FF_API_BASE=https://felt-and-fortune.fly.dev python scripts/build_native.py
    npx cap sync
"""
import os, shutil, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
api = os.environ.get('FF_API_BASE', '').rstrip('/')
if not api.startswith('https://'):
    sys.exit('Set FF_API_BASE to the hosted https:// address of the server first.')
out = root / 'native-www'
shutil.rmtree(out, ignore_errors=True)
shutil.copytree(root / 'public', out)
(out / 'config.js').write_text(f"window.FF_API_BASE = {api!r};\nwindow.FF_NATIVE = true;\n", encoding='utf-8')
print(f'Built {out} for {api}')

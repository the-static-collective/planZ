"""Check package files against a local SHA-256 manifest (not authenticity)."""
from pathlib import Path
import hashlib, json, sys
root=Path(__file__).resolve().parent
manifest=json.loads((root/'SOURCE-SHA256.json').read_text())
failed=[]
for name,expected in manifest.items():
    p=root/name
    if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=expected:failed.append(name)
print('Mismatch: '+', '.join(failed) if failed else f'Verified {len(manifest)} source/package files')
sys.exit(bool(failed))

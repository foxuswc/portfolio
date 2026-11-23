"""Buildless checks: local links, anchors, image metadata and recruiting copy."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re, subprocess, tempfile
ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids = []; self.refs = []; self.images = []; self.meta = {}
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if d.get('id'): self.ids.append(d['id'])
        if tag in ('a', 'link', 'script', 'img'):
            self.refs.append(d.get('href', d.get('src', '')))
        if tag == 'img': self.images.append(d)
        if tag == 'meta': self.meta[d.get('name')] = d.get('content')
pages = {}
for path in ROOT.glob('*.html'):
    doc = Page(); doc.feed(path.read_text()); pages[path.name] = doc
errors = []
for name, doc in pages.items():
    text = (ROOT / name).read_text()
    if 'width=device-width' not in doc.meta.get('viewport', ''): errors.append(f'{name}: viewport')
    if len(doc.ids) != len(set(doc.ids)): errors.append(f'{name}: duplicate IDs')
    if re.search('柔性智能|Soft Intelligence', text, re.I): errors.append(f'{name}: unclear positioning')
    if 'data:image/' in text: errors.append(f'{name}: inline image')
    for image in doc.images:
        if 'alt' not in image: errors.append(f'{name}: image alt')
    for ref in doc.refs:
        u = urlsplit(ref)
        if u.scheme or not ref: continue
        target = unquote(u.path).lstrip('/') or (name if u.fragment else 'index.html')
        if not (ROOT / target).exists(): errors.append(f'{name}: missing {ref}')
        if u.fragment and target in pages and u.fragment not in pages[target].ids:
            errors.append(f'{name}: missing anchor {ref}')
    for script in re.findall(r'<script[^>]*>(.*?)</script>', text, re.S):
        if not script.strip(): continue
        with tempfile.NamedTemporaryFile(suffix='.js', mode='w') as tmp:
            tmp.write(script); tmp.flush()
            result = subprocess.run(['node', '--check', tmp.name], capture_output=True, text=True)
            if result.returncode: errors.append(f'{name}: {result.stderr}')
subprocess.run(['node', '--check', str(ROOT/'assets/site.js')], check=True)
if errors: raise SystemExit('\n'.join(errors))
for name in pages: print(f'PASS {name}: assets, links, anchors, viewport, copy and JS')

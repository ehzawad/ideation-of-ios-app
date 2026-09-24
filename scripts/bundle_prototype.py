#!/usr/bin/env python3
"""Bundle the simulator into one self-contained HTML file.

Usage: python3 scripts/bundle_prototype.py
Reads agentic-os/prototype/index.html and inlines os.js, planner.js and ui.js,
writing agentic-os/prototype/the-line.html (open it straight from disk, or share it as one file).
"""
import pathlib, re

here = pathlib.Path(__file__).resolve().parent.parent / 'agentic-os' / 'prototype'
page = (here / 'index.html').read_text()

def inline(match):
    src = match.group(1)
    code = (here / src).read_text().replace('</script', '<\\/script')
    return f'<script>\n// ---- {src} ----\n{code}\n</script>'

body = re.sub(r'<script src="([^"]+\.js)"></script>', inline, page)
# Hoist the head-type tags (meta, title, links, style) into a real <head>.
split = body.index('<div class="app">')
head, rest = body[:split], body[split:]
out = f'<!doctype html>\n<html lang="en">\n<head>\n{head.strip()}\n</head>\n<body>\n{rest.strip()}\n</body>\n</html>\n'
(here / 'the-line.html').write_text(out)
print(f'wrote {here / "the-line.html"} ({len(out) // 1024} KB)')

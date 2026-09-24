#!/usr/bin/env python3
"""appledoc: fetch an Apple developer documentation page and print it as markdown.

Usage:
  python3 appledoc.py documentation/foundationmodels/languagemodelsession
  python3 appledoc.py foundationmodels/languagemodelsession        (documentation/ prefix optional)
  python3 appledoc.py design/human-interface-guidelines/materials
  python3 appledoc.py --search foundationmodels generable            (list child symbols matching a word)

Prints: title, kind, platforms (with iOS introduced version, deprecated, beta), declaration,
abstract, discussion/content, and topic sections (children with their paths) so you can drill down.
Exit code 2 if the page does not exist (404): the symbol path is wrong or the API doesn't exist.
"""
import json, sys, urllib.request, urllib.error, os, hashlib

CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.appledoc-cache')
os.makedirs(CACHE, exist_ok=True)

def fetch(path):
    path = path.strip('/')
    if not (path.startswith('documentation/') or path.startswith('design/')):
        path = 'documentation/' + path
    path = path.lower() if path.startswith('documentation/') else path
    url = f'https://developer.apple.com/tutorials/data/{path}.json'
    key = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest() + '.json')
    if os.path.exists(key):
        return json.load(open(key)), url
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            data = r.read()
    except urllib.error.HTTPError as e:
        return None, url
    open(key, 'wb').write(data)
    return json.loads(data), url

def inline(nodes, refs):
    out = []
    for n in nodes or []:
        t = n.get('type')
        if t == 'text': out.append(n.get('text', ''))
        elif t == 'codeVoice': out.append('`' + n.get('code', '') + '`')
        elif t == 'reference':
            r = refs.get(n.get('identifier'), {})
            title = r.get('title') or n.get('identifier', '').split('/')[-1]
            out.append('`' + title + '`' if r.get('kind') == 'symbol' else title)
        elif 'inlineContent' in n: out.append(inline(n['inlineContent'], refs))
    return ''.join(out)

def block(nodes, refs, depth=0):
    out = []
    for n in nodes or []:
        t = n.get('type')
        if t == 'heading': out.append('\n' + '#' * min(6, n.get('level', 2) + 1) + ' ' + n.get('text', ''))
        elif t == 'paragraph': out.append(inline(n.get('inlineContent'), refs))
        elif t in ('unorderedList', 'orderedList'):
            for it in n.get('items', []):
                out.append('  ' * depth + '- ' + block(it.get('content'), refs, depth + 1).strip())
        elif t == 'codeListing': out.append('```' + (n.get('syntax') or '') + '\n' + '\n'.join(n.get('code', [])) + '\n```')
        elif t == 'aside': out.append('> ' + (n.get('name') or n.get('style', '')).upper() + ': ' + block(n.get('content'), refs).strip())
        elif t == 'table':
            for row in n.get('rows', []):
                out.append('| ' + ' | '.join(block(c, refs).strip().replace('\n', ' ') for c in row) + ' |')
        elif 'content' in n: out.append(block(n['content'], refs, depth))
    return '\n'.join(out)

def render(d, url):
    refs = d.get('references', {})
    md = d.get('metadata', {})
    lines = [f"# {md.get('title', '?')}", f"URL: {url.replace('/tutorials/data', '').replace('.json', '')}", f"Kind: {md.get('symbolKind') or md.get('role') or md.get('roleHeading', '')}"]
    plats = md.get('platforms', [])
    if plats:
        lines.append('Platforms: ' + ', '.join(f"{p.get('name')} {p.get('introducedAt', '?')}" + (' (beta)' if p.get('beta') else '') + (f" deprecated {p.get('deprecatedAt')}" if p.get('deprecatedAt') else '') for p in plats))
    for sec in d.get('primaryContentSections', []):
        if sec.get('kind') == 'declarations':
            for dec in sec.get('declarations', []):
                lines.append('```swift\n' + ''.join(tok.get('text', '') for tok in dec.get('tokens', [])) + '\n```')
    ab = inline(d.get('abstract', []), refs)
    if ab: lines.append('Abstract: ' + ab)
    for sec in d.get('primaryContentSections', []):
        if sec.get('kind') == 'content':
            lines.append(block(sec.get('content'), refs))
        if sec.get('kind') == 'parameters':
            for p in sec.get('parameters', []):
                lines.append(f"- param `{p.get('name')}`: " + block(p.get('content'), refs).strip())
    for sec in d.get('sections', []):
        if sec.get('kind') == 'taskLists' or 'content' in sec:
            lines.append(block(sec.get('content', []), refs))
    for sec in d.get('topicSections', []):
        lines.append(f"\n## Topics: {sec.get('title', '')}")
        for i in sec.get('identifiers', []):
            r = refs.get(i, {})
            lines.append(f"- {r.get('title', i.split('/')[-1])}  ->  {r.get('url', '')}" + (f"  ({inline(r.get('abstract', []), refs)[:140]})" if r.get('abstract') else ''))
    for sec in d.get('relationshipsSections', []):
        lines.append(f"\n## {sec.get('title', '')}: " + ', '.join(refs.get(i, {}).get('title', '') for i in sec.get('identifiers', [])))
    return '\n'.join(lines)

def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__); sys.exit(1)
    if args[0] == '--search':
        d, url = fetch(args[1])
        if d is None: print('404', url); sys.exit(2)
        word = args[2].lower()
        for i, r in d.get('references', {}).items():
            if word in (r.get('title', '') + r.get('url', '')).lower():
                print(f"{r.get('title')}  ->  {r.get('url')}")
        return
    d, url = fetch(args[0])
    if d is None:
        print(f'404 NOT FOUND: {url}'); sys.exit(2)
    print(render(d, url))

if __name__ == '__main__':
    main()

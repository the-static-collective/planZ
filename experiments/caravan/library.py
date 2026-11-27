#!/usr/bin/env python3
"""CARAVAN 003: operator-curated offline document shelf; no network dependency."""
import argparse, hashlib, html, os, sqlite3, sys, uuid
from pathlib import Path
from contextlib import contextmanager
from urllib.parse import parse_qs

MAX=64*1024*1024
FORMATS={'.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8','.pdf':'application/pdf','.epub':'application/epub+zip'}

def check(ok,msg):
    if not ok: raise ValueError(msg)
def field(value,limit=240):
    check(isinstance(value,str) and 0<len(value.strip())<=limit and not any(ord(c)<32 for c in value),'Invalid metadata')
    return value.strip()
def sha(data): return hashlib.sha256(data).hexdigest()
@contextmanager
def catalog(root):
    root.mkdir(parents=True,exist_ok=True)
    c=sqlite3.connect(root/'catalog.sqlite'); c.row_factory=sqlite3.Row
    try:
        c.execute('CREATE TABLE IF NOT EXISTS documents(id TEXT PRIMARY KEY,title TEXT NOT NULL,credit TEXT NOT NULL,rights TEXT NOT NULL,category TEXT NOT NULL,description TEXT NOT NULL,ext TEXT NOT NULL,sha TEXT UNIQUE NOT NULL,size INTEGER NOT NULL,local INTEGER NOT NULL DEFAULT 0)')
        with c: yield c
    finally: c.close()
def add(root,path,title,credit,rights,category,description=''):
    ext=path.suffix.lower(); check(ext in FORMATS,'Supported: TXT, MD, PDF, EPUB')
    check(0<path.stat().st_size<=MAX,'Document exceeds size limit or empty')
    data=path.read_bytes(); check(0<len(data)<=MAX,'Invalid size')
    if ext in ('.txt','.md'): data.decode('utf-8')
    if ext=='.pdf': check(data.startswith(b'%PDF-'),'Not a PDF header')
    if ext=='.epub': check(data.startswith(b'PK\x03\x04'),'Not an EPUB container header')
    title,credit,rights,category=map(field,(title,credit,rights,category))
    description=field(description,1000) if description else ''
    ident=uuid.uuid4().hex; folder=root/'documents';folder.mkdir(parents=True,exist_ok=True)
    target=folder/(ident+ext); temp=folder/(ident+'.pending'); written=False
    try:
        with catalog(root) as c:
            c.execute('INSERT INTO documents VALUES (?,?,?,?,?,?,?,?,?,0)',(ident,title,credit,rights,category,description,ext,sha(data),len(data)))
            with temp.open('xb') as f: f.write(data); f.flush();os.fsync(f.fileno())
            os.replace(temp,target); written=True
    except BaseException:
        temp.unlink(missing_ok=True)
        if written: target.unlink(missing_ok=True)
        raise
    return ident

def item(root,ident):
    check(len(ident)==32 and all(x in '0123456789abcdef' for x in ident),'Invalid document ID')
    with catalog(root) as c: row=c.execute('SELECT * FROM documents WHERE id=?',(ident,)).fetchone()
    check(row is not None,'Unknown document');return row

def bytes_for(root,row):
    check(row['ext'] in FORMATS and 0<row['size']<=MAX,'Invalid record')
    path=root/'documents'/(row['id']+row['ext']);check(path.is_file() and path.stat().st_size==row['size'],'Document missing or changed')
    data=path.read_bytes();check(sha(data)==row['sha'],'Digest mismatch');return data

def permit(root,ident,allow):
    row=item(root,ident)
    if allow: bytes_for(root,row)
    with catalog(root) as c: c.execute('UPDATE documents SET local=? WHERE id=?',(int(allow),ident))

def search(root,q='',category=''):
    with catalog(root) as c: rows=c.execute('SELECT * FROM documents WHERE local=1 ORDER BY category,title,id').fetchall()
    words=q.casefold().split()
    return [r for r in rows if (not category or r['category']==category) and all(w in ' '.join(r[k] for k in ('title','credit','category','description')).casefold() for w in words)]

def section(root,query=''):
    params=parse_qs(query,max_num_fields=8);q=params.get('q',[''])[0][:240];cat=params.get('category',[''])[0][:240]
    esc=html.escape; categories=sorted({r['category'] for r in search(root)})
    options='<option value="">All categories</option>'+''.join(f'<option value="{esc(v,quote=True)}"'+(' selected' if v==cat else '')+f'>{esc(v)}</option>' for v in categories)
    cards=''.join(f'<article><small>{esc(r["category"])} · {esc(r["ext"][1:].upper())}</small><h3>{esc(r["title"])}</h3><p>{esc(r["credit"])} · {esc(r["rights"])}</p><p>{esc(r["description"])}</p>'+ (f'<p><a href="/read/{r["id"]}">Read locally</a></p>' if r['ext'] in ('.txt','.md') else '')+f'<p><a href="/document/{r["id"]}">Download ({r["size"]:,} bytes)</a></p></article>' for r in search(root,q,cat))
    return f'<h2>Community library</h2><form action="/" method="get"><label>Search <input name="q" value="{esc(q,quote=True)}" maxlength="240"></label><label> Category <select name="category">{options}</select></label><button type="submit">Find</button> <a href="/">Clear</a></form>{cards or "<p>No shared resources match.</p>"}'

def guest(root,ident,read=False):
    row=item(root,ident);check(row['local']==1,'Not shared');data=bytes_for(root,row)
    if read:
        check(row['ext'] in ('.txt','.md'),'Plain text only');esc=html.escape
        return (f'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(row["title"])}</title><style>body{{font:18px system-ui;max-width:760px;margin:24px auto;padding:16px;line-height:1.6}}pre{{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}}</style><main><a href="/">Back to community library</a><h1>{esc(row["title"])}</h1><pre>{esc(data.decode("utf-8"))}</pre></main></html>'.encode(),'text/html; charset=utf-8',None)
    return data,FORMATS[row['ext']],f'attachment; filename="resource-{ident}{row["ext"]}"'

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--data',type=Path,default=Path('caravan-data'));s=p.add_subparsers(dest='cmd',required=True)
    x=s.add_parser('add');x.add_argument('file',type=Path)
    for key in ('title','credit','rights','category'): x.add_argument('--'+key,required=True)
    x.add_argument('--description',default='')
    for name in ('allow','revoke','verify'): x=s.add_parser(name);x.add_argument('id')
    s.add_parser('list');a=p.parse_args();r=a.data
    try:
        if a.cmd=='add': print(add(r,a.file,a.title,a.credit,a.rights,a.category,a.description))
        elif a.cmd in ('allow','revoke'): permit(r,a.id,a.cmd=='allow')
        elif a.cmd=='verify': print('SHA-256 verified:',sha(bytes_for(r,item(r,a.id))))
        elif a.cmd=='list':
            with catalog(r) as c:
                for row in c.execute('SELECT id,title,category,local FROM documents ORDER BY category,title'): print(*row,sep=' | ')
    except (ValueError,OSError,sqlite3.Error) as e: print('HOLD:',e,file=sys.stderr);return 1
    return 0
if __name__=='__main__':sys.exit(main())

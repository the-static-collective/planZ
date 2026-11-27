#!/usr/bin/env python3
"""CARAVAN First Signal: local field prototype; Python 3.9+, no dependencies."""
import argparse, hashlib, html, ipaddress, json, os, re, shutil, sqlite3, sys, uuid, wave, struct, math, zipfile
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
from contextlib import contextmanager
import library as shelf

MAX = 64*1024*1024
TYPES={'.wav':'audio/wav','.mp3':'audio/mpeg','.ogg':'audio/ogg','.m4a':'audio/mp4'}
ID=re.compile(r'^[0-9a-f]{32}$')
SCOPES={'local','review'}
def require(ok, message):
    if not ok: raise ValueError(message)
def digest(b): return hashlib.sha256(b).hexdigest()
def clean(s):
    require(isinstance(s,str) and 0<len(s)<=240 and not any(ord(c)<32 for c in s),'Invalid text (1–240 printable characters)')
    return s
@contextmanager
def db(root):
    root.mkdir(parents=True,exist_ok=True)
    c=sqlite3.connect(root/'catalog.sqlite')
    try:
        c.execute('CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY, title TEXT, attribution TEXT, ext TEXT, sha TEXT, size INTEGER, local INTEGER, review INTEGER, state TEXT)')
        c.execute('CREATE TABLE IF NOT EXISTS settings(k TEXT PRIMARY KEY,v TEXT)')
        c.execute('CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY, text TEXT)')
        with c: yield c
    finally: c.close()
def put(root, data, ext, title, attribution, scopes=(), state='OWNED'):
    require(ext in TYPES and 0<len(data)<=MAX,'Unsupported format or size')
    clean(title);clean(attribution);require(set(scopes)<=SCOPES,'Invalid permission')
    with db(root) as c:
        existing=c.execute('SELECT id FROM media WHERE sha=?',(digest(data),)).fetchone()
        require(not existing,'Duplicate bytes; existing item '+str(existing))
        ident=uuid.uuid4().hex
        folder=root/'audio';folder.mkdir(exist_ok=True)
        path=folder/(ident+ext)
        path.write_bytes(data)
        c.execute('INSERT INTO media VALUES (?,?,?,?,?,?,?,?,?)',(ident,title,attribution,ext,digest(data),len(data),int('local' in scopes),int('review' in scopes),state))
    return ident
def item(root, ident):
    require(ID.fullmatch(ident),'Invalid item ID')
    with db(root) as c: row=c.execute('SELECT * FROM media WHERE id=?',(ident,)).fetchone()
    require(row is not None,'Unknown item');return row
def media_bytes(root,row):
    p=root/'audio'/(row[0]+row[3]);require(p.is_file() and p.stat().st_size==row[5] and row[5]<=MAX,'Media missing or changed')
    data=p.read_bytes();require(digest(data)==row[4],'Media digest mismatch');return data
def permission(root,ident,scope,allow):
    require(scope in SCOPES,'Unknown permission');row=item(root,ident)
    require(not allow or row[8]=='OWNED','Received material is HOLD; no guest playback or re-export')
    with db(root) as c: c.execute('UPDATE media SET '+scope+'=? WHERE id=?',(int(allow),ident))
def export(root,ident,recipient,out):
    clean(recipient);row=item(root,ident);require(row[7] and row[8]=='OWNED','External review not permitted')
    data=media_bytes(root,row)
    manifest={'schema':'caravan.review/v0','title':row[1],'attribution':row[2],'ext':row[3],'sha256':row[4],'size':row[5],'recipient':recipient,'scope':'review-only','state':'HOLD'}
    with zipfile.ZipFile(out,'x',compression=zipfile.ZIP_STORED) as z:
        z.writestr('manifest.json',json.dumps(manifest,indent=2));z.writestr('audio'+row[3],data)
def receive(root,path,recipient):
    with zipfile.ZipFile(path) as z:
        entries=z.infolist();require(len(entries)==2 and len(set(z.namelist()))==2,'Unexpected archive members')
        require(all(0<i.file_size<=MAX for i in entries),'Archive too large')
        require(z.getinfo('manifest.json').file_size<=4096,'Manifest too large')
        m=json.loads(z.read('manifest.json'));require(isinstance(m,dict),'Bad manifest')
        require(set(m)=={'schema','title','attribution','ext','sha256','size','recipient','scope','state'},'Invalid manifest fields')
        require(m['schema']=='caravan.review/v0' and m['scope']=='review-only' and m['state']=='HOLD' and m['recipient']==recipient,'Wrong schema, scope or recipient')
        require(m['ext'] in TYPES and set(z.namelist())=={'manifest.json','audio'+m['ext']},'Invalid media entry')
        data=z.read('audio'+m['ext']);require(len(data)==m['size'] and digest(data)==m['sha256'],'Digest or size mismatch')
    return put(root,data,m['ext'],m['title'],m['attribution'],state='HOLD')
def refuse(root,ident):
    row=item(root,ident);require(row[8]=='HOLD','Only received HOLD can be refused')
    with db(root) as c: c.execute("UPDATE media SET state='REFUSED', local=0, review=0 WHERE id=?",(ident,))
def demo(root):
    import io
    b=io.BytesIO()
    with wave.open(b,'wb') as w:
        w.setparams((1,2,16000,0,'NONE','not compressed'))
        w.writeframes(b''.join(struct.pack('<h',int(2000*math.sin(2*math.pi*440*i/16000)*min(1,i/800,(16000-i)/800))) for i in range(16000)))
    return put(root,b.getvalue(),'.wav','First Signal (synthetic tone)','CARAVAN test fixture',('local','review'))
CSS='''*{box-sizing:border-box}body{margin:0;background:#171e1b;color:#e8e8dc;font:16px system-ui,sans-serif}main{max-width:720px;margin:auto;padding:24px}header{border-bottom:1px solid #526356;padding:20px 0}small{letter-spacing:.15em;color:#a8bdab}h1{font-size:2.4rem;margin:.4em 0}h2{font-size:1.2rem}article{background:#25312a;border:1px solid #526356;border-radius:12px;padding:16px;margin:12px 0}audio{width:100%;margin-top:12px}p{line-height:1.5;color:#c6cfc4}a{color:#b9e4cb}input,select,button{font:inherit;max-width:100%;padding:6px;margin:4px}footer{border-top:1px solid #526356;margin-top:30px;padding-top:20px}'''
def page(root,query=""):
    import airwaves
    with db(root) as c:
        name=c.execute("SELECT v FROM settings WHERE k='name'").fetchone(); events=c.execute('SELECT text FROM events ORDER BY id').fetchall(); rows=c.execute("SELECT * FROM media WHERE local=1 AND state='OWNED'").fetchall()
    esc=html.escape
    cards=''.join(f'<article><strong>{esc(r[1])}</strong><p>{esc(r[2])}</p><audio controls preload="none" src="/audio/{r[0]}"></audio></article>' for r in rows)
    schedule=''.join(f'<article>{esc(e[0])}</article>' for e in events)
    return f'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CARAVAN</title><style>{CSS}</style><main><header><small>CARAVAN / COMMUNITY HOUSE / LOCAL</small><h1>{esc(name[0] if name else "Community Media House")}</h1><p>One body. Many vocations. Connected to this local host; internet not required.</p></header><h2>Gatherings</h2>{schedule or "<p>No notices posted.</p>"}<h2>Local listening room</h2>{cards or "<p>No recordings approved for local listening.</p>"}{shelf.section(root,query)}{airwaves.section(root)}<footer>Local guest portal · Read only · No accounts · No external requests</footer></main></html>'.encode()
def handler(root):
    class Guest(BaseHTTPRequestHandler):
        def log_message(self,*args): pass
        def do_GET(self):
            parsed=urlsplit(self.path);path=parsed.path;disposition=None
            import airwaves
            from urllib.parse import parse_qs
            try:
                if path=='/': data=page(root,parsed.query);typ='text/html; charset=utf-8'
                elif path=='/radio': data=airwaves.page(root,parse_qs(parsed.query).get('station',[''])[0]);typ='text/html; charset=utf-8'
                elif path=='/radio.js': data=airwaves.JS;typ='application/javascript; charset=utf-8'
                elif path.startswith('/document/'): data,typ,disposition=shelf.guest(root,path[10:])
                elif path.startswith('/read/'): data,typ,disposition=shelf.guest(root,path[6:],True)
                elif path.startswith('/audio/'):
                    row=item(root,path[7:]);require(row[6] and row[8]=='OWNED','Not shared');data=media_bytes(root,row);typ=TYPES[row[3]]
                else: return self.send_error(404)
            except (ValueError,OSError,sqlite3.Error): return self.send_error(404)
            self.send_response(200);
            if disposition: self.send_header('Content-Disposition',disposition)
            self.send_header('Content-Type',typ);self.send_header('Content-Length',str(len(data)));self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; media-src 'self';"+(" script-src 'self';" if path=='/radio' else "")+" form-action 'self'; base-uri 'none'; frame-ancestors 'none'");self.end_headers()
            try: self.wfile.write(data)
            except (BrokenPipeError,ConnectionResetError): pass
        def do_POST(self): self.send_error(405)
    return Guest
def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--data',type=Path,default=Path('caravan-data'));s=p.add_subparsers(dest='cmd',required=True)
    x=s.add_parser('init');x.add_argument('name')
    s.add_parser('demo');s.add_parser('list')
    x=s.add_parser('notice');x.add_argument('text')
    x=s.add_parser('add');x.add_argument('file',type=Path);x.add_argument('--title',required=True);x.add_argument('--attribution',required=True)
    for name in ('allow','revoke'):
        x=s.add_parser(name);x.add_argument('id');x.add_argument('scope',choices=sorted(SCOPES))
    x=s.add_parser('export');x.add_argument('id');x.add_argument('recipient');x.add_argument('file',type=Path)
    x=s.add_parser('receive');x.add_argument('file',type=Path);x.add_argument('recipient')
    x=s.add_parser('refuse');x.add_argument('id')
    x=s.add_parser('serve');x.add_argument('--bind',default='127.0.0.1');x.add_argument('--port',type=int,default=8765);x.add_argument('--private-lan',action='store_true')
    a=p.parse_args();r=a.data
    try:
        if a.cmd=='init':
            with db(r) as c: c.execute('INSERT OR REPLACE INTO settings VALUES (?,?)',('name',clean(a.name)))
        elif a.cmd=='notice':
            with db(r) as c: c.execute('INSERT INTO events(text) VALUES (?)',(clean(a.text),))
        elif a.cmd=='demo': print(demo(r))
        elif a.cmd=='add':
            require(a.file.stat().st_size<=MAX,'File too large');print(put(r,a.file.read_bytes(),a.file.suffix.lower(),a.title,a.attribution))
        elif a.cmd=='list':
            with db(r) as c:
                for row in c.execute('SELECT id,title,local,review,state FROM media'):print(*row,sep=' | ')
        elif a.cmd in ('allow','revoke'): permission(r,a.id,a.scope,a.cmd=='allow')
        elif a.cmd=='export': export(r,a.id,a.recipient,a.file)
        elif a.cmd=='receive': print(receive(r,a.file,a.recipient))
        elif a.cmd=='refuse': refuse(r,a.id)
        elif a.cmd=='serve':
            ip=ipaddress.IPv4Address(a.bind);private=any(ip in ipaddress.IPv4Network(n) for n in ('10.0.0.0/8','172.16.0.0/12','192.168.0.0/16'))
            require(ip.is_loopback or (a.private_lan and private),'Use loopback or explicitly approved private IPv4 LAN address; no wildcard/public bind')
            server=ThreadingHTTPServer((a.bind,a.port),handler(r));print(f'Guest portal: http://{a.bind}:{a.port}/ (Ctrl-C stops)',flush=True)
            try:server.serve_forever()
            except KeyboardInterrupt:pass
            finally:server.server_close()
    except (ValueError,OSError,sqlite3.Error,zipfile.BadZipFile,KeyError,TypeError) as e: print('HOLD:',e,file=sys.stderr);return 1
    return 0
if __name__=='__main__':sys.exit(main())

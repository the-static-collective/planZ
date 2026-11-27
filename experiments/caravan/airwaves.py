#!/usr/bin/env python3
"""CARAVAN 005: owner-local lineup and station review, never automatic airtime."""
import argparse, html, json, sqlite3, sys, time
from pathlib import Path
from contextlib import contextmanager
import caravan as media

@contextmanager
def radio_db(root):
    root.mkdir(parents=True,exist_ok=True)
    c=sqlite3.connect(root/'airwaves.sqlite')
    try:
        c.execute('CREATE TABLE IF NOT EXISTS stations(name TEXT PRIMARY KEY)')
        c.execute('CREATE TABLE IF NOT EXISTS lineup(station TEXT, position INTEGER, media_id TEXT, PRIMARY KEY(station,position))')
        c.execute('CREATE TABLE IF NOT EXISTS review(offer TEXT, station TEXT, PRIMARY KEY(offer,station))')
        with c: yield c
    finally: c.close()

def station(root,name):
    media.clean(name)
    with radio_db(root) as c:c.execute('INSERT OR IGNORE INTO stations VALUES (?)',(name,))

def replace(root,name,ids):
    media.require(0<len(ids)<=500,'Lineup requires 1–500 entries')
    for ident in ids:
        r=media.item(root,ident);media.require(r[6] and r[8]=='OWNED','Local sharing required');media.media_bytes(root,r)
    with radio_db(root) as c:
        media.require(c.execute('SELECT 1 FROM stations WHERE name=?',(name,)).fetchone(),'Unknown station')
        c.execute('DELETE FROM lineup WHERE station=?',(name,))
        c.executemany('INSERT INTO lineup VALUES (?,?,?)',[(name,i,id) for i,id in enumerate(ids)])

def lineup(root,name):
    with radio_db(root) as c:
        media.require(c.execute('SELECT 1 FROM stations WHERE name=?',(name,)).fetchone(),'Unknown station')
        ids=c.execute('SELECT media_id FROM lineup WHERE station=? ORDER BY position',(name,)).fetchall()
    result=[]
    for (ident,) in ids:
        try:
            r=media.item(root,ident)
            if r[6] and r[8]=='OWNED':
                # Delivery endpoint revalidates bytes and permission on every request.
                result.append({'id':r[0],'title':r[1],'credit':r[2],'url':'/audio/'+r[0]})
        except (ValueError,OSError):pass
    return result

def names(root):
    with radio_db(root) as c:return [r[0] for r in c.execute('SELECT name FROM stations ORDER BY name')]

def held_audio(root,ident):
    import crossing as cross
    with cross.journal(root) as c:
        r=c.execute('SELECT envelope,payload,state FROM incoming WHERE id=?',(ident,)).fetchone()
        media.require(r is not None and r[2]=='HOLD','Only active HOLD material may be reviewed')
        obj=cross.parse(r[0]); b=cross.verify(c,obj,'offer')
        media.require(obj['id']==ident and b['recipient']==cross.fingerprint(cross.identity(root).public_key()) and b['scope']=='review-only' and b['content_kind']=='audio','Wrong offer or scope')
        media.require(b['created']<=int(time.time())+300 and int(time.time())<=b['expires'],'Offer expired or future dated')
        media.require(b['size']==len(r[1]) and b['sha256']==cross.sha(r[1]),'Stored audio corrupted')
        return {'offer':ident,'source_fingerprint':b['sender'],'recipient_fingerprint':b['recipient'],'title':b['title'],'attribution':b['credit'],'rights_statement':b['rights'],'sha256':b['sha256'],'size':b['size'],'format':b['ext'],'expires':b['expires'],'scope':'review-only','status':'HOLD','airtime':'NOT_AUTHORIZED'}

def stage(root,name,ident):
    item=held_audio(root,ident)
    with radio_db(root) as c:
        media.require(c.execute('SELECT 1 FROM stations WHERE name=?',(name,)).fetchone(),'Unknown station')
        c.execute('INSERT OR IGNORE INTO review VALUES (?,?)',(ident,name))
    return item

def review(root,name):
    from cryptography.exceptions import InvalidSignature
    with radio_db(root) as c:
        ids=c.execute('SELECT offer FROM review WHERE station=? ORDER BY offer',(name,)).fetchall()
    result=[]
    for (ident,) in ids:
        try:result.append(dict(held_audio(root,ident),station=name))
        except (ValueError,OSError,sqlite3.Error,InvalidSignature,KeyError,TypeError,AttributeError):result.append({'offer':ident,'station':name,'status':'BLOCKED','airtime':'NOT_AUTHORIZED'})
    return result

def section(root):
    from urllib.parse import urlencode
    links=''.join('<li><a href="/radio?'+html.escape(urlencode({'station':n}),quote=True)+'">'+html.escape(n)+'</a></li>' for n in names(root))
    return '<h2>Local radio</h2><ul>'+links+'</ul>' if links else ''

def page(root,name):
    rows=lineup(root,name)
    items=''.join(f'<li><button class="track" data-src="{r["url"]}">{html.escape(r["title"])}</button> — {html.escape(r["credit"])}</li>' for r in rows)
    return f'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(name)}</title><style>{media.CSS}</style><main><a href="/">Community house</a><h1>{html.escape(name)}</h1><p>Local listening lineup. User-started playback; not a synchronized live broadcast. Reload to refresh the lineup.</p><audio id="player" controls preload="none"></audio><p id="status" role="status">Choose a track to start.</p><ol>{items}</ol><script src="/radio.js" defer></script></main></html>'.encode()

JS=b'''"use strict"; const audio=document.getElementById("player"), status=document.getElementById("status"), tracks=[...document.querySelectorAll(".track")]; let index=-1; function start(i){if(i>=tracks.length){status.textContent="End of lineup";return;}index=i;audio.src=tracks[i].dataset.src;status.textContent=tracks[i].textContent;audio.play().catch(()=>{status.textContent="Playback unavailable; choose another track or reload.";});} tracks.forEach((b,i)=>b.addEventListener("click",()=>start(i)));audio.addEventListener("ended",()=>start(index+1));audio.addEventListener("error",()=>{status.textContent="Track unavailable; choose another track or reload.";});'''

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--data',type=Path,default=Path('caravan-data'));s=p.add_subparsers(dest='cmd',required=True)
    for cmd in ('station','list','review'):
        a=s.add_parser(cmd);a.add_argument('name')
    a=s.add_parser('lineup');a.add_argument('name');a.add_argument('ids',nargs='+')
    a=s.add_parser('stage');a.add_argument('name');a.add_argument('offer')
    a=p.parse_args();r=a.data
    try:
        if a.cmd=='station':station(r,a.name)
        elif a.cmd=='lineup':replace(r,a.name,a.ids)
        elif a.cmd=='list':print(json.dumps(lineup(r,a.name),indent=2))
        elif a.cmd=='stage':print(json.dumps(stage(r,a.name,a.offer),indent=2))
        elif a.cmd=='review':print(json.dumps(review(r,a.name),indent=2))
    except Exception as e:print('HOLD:',str(e) or type(e).__name__,file=sys.stderr);return 1
    return 0
if __name__=='__main__':sys.exit(main())

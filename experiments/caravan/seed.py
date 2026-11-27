#!/usr/bin/env python3
"""CARAVAN 006: independent foundation and optional signed ancestry, no authority transfer."""
import argparse, json, os, shutil, sqlite3, sys, tempfile, time, uuid
from pathlib import Path
import caravan as media
import crossing as cross

LAW='independent-local-authority/no-inherited-permissions'

def me(root): return cross.fingerprint(cross.identity(root).public_key())
def fresh(root,name):
    media.clean(name)
    root=Path(root).absolute(); cross.need(not root.exists() and not root.is_symlink(),'Destination must not exist')
    cross.need(root.parent.is_dir(),'Parent directory must exist')
    # Exclusive directory reservation; never clone or overwrite another node.
    root.mkdir(mode=0o700)
    try:
        with media.db(root) as c:c.execute('INSERT INTO settings VALUES (?,?)',('name',name))
        ident=cross.init(root)
        with cross.journal(root): pass
        with ancestry(root): pass
        return ident
    except BaseException:
        shutil.rmtree(root);raise

from contextlib import contextmanager
@contextmanager
def ancestry(root):
    c=sqlite3.connect(root/'ancestry.sqlite')
    try:
        c.execute('CREATE TABLE IF NOT EXISTS seeds(id TEXT PRIMARY KEY, envelope BLOB NOT NULL, genesis BLOB)')
        c.execute('CREATE TABLE IF NOT EXISTS founding(slot INTEGER PRIMARY KEY CHECK(slot=1), seed BLOB NOT NULL, genesis BLOB NOT NULL)')
        with c:yield c
    finally:c.close()

def invite(root,recipient,out,ttl=86400):
    cross.need(type(ttl) is int and 1<=ttl<=604800,'Invalid lifetime')
    sender=me(root); cross.need(sender!=recipient,'Independent node required')
    with cross.journal(root) as c:cross.pinned(c,recipient)
    now=int(time.time());body={'schema':cross.SCHEMA,'kind':'seed','sender':sender,'recipient':recipient,'nonce':uuid.uuid4().hex,'created':now,'expires':now+ttl,'law':LAW}
    obj=cross.sign(cross.identity(root),body);raw=cross.canonical(obj)
    with ancestry(root) as c:
        c.execute('INSERT INTO seeds VALUES (?,?,NULL)',(obj['id'],raw));cross.write_new(out,raw)
    return obj['id']

def read(path):return cross.parse(cross.bounded(path,16384))
def verify_seed(root,obj):
    with cross.journal(root) as c:b=cross.verify(c,obj,'seed')
    cross.need(set(b)=={'schema','kind','sender','recipient','nonce','created','expires','law'} and b['law']==LAW,'Invalid seed contract')
    cross.need(b['recipient']==me(root) and b['sender']!=me(root),'Wrong recipient')
    cross.need(isinstance(b['nonce'],str) and media.ID.fullmatch(b['nonce']),'Invalid nonce')
    cross.need(type(b['created']) is int and type(b['expires']) is int and 1<=b['expires']-b['created']<=604800,'Invalid lifetime')
    return b

def adopt(root,path,confirm=False):
    cross.need(confirm,'Explicit local founding decision required')
    obj=read(path);b=verify_seed(root,obj)
    with ancestry(root) as c:
        c.execute('BEGIN IMMEDIATE');old=c.execute('SELECT seed,genesis FROM founding WHERE slot=1').fetchone()
        if old:
            cross.need(cross.parse(old[0])['id']==obj['id'],'Independent founding already recorded; no replacement');return cross.parse(old[1])['id']
        now=int(time.time());cross.need(b['created']<=now+300 and now<=b['expires'],'Expired or future seed')
        body={'schema':cross.SCHEMA,'kind':'genesis','sender':me(root),'recipient':b['sender'],'seed':obj['id'],'created':now,'law':LAW}
        gen=cross.sign(cross.identity(root),body)
        c.execute('INSERT INTO founding VALUES (1,?,?)',(cross.canonical(obj),cross.canonical(gen)))
    return gen['id']

def genesis(root,out):
    with ancestry(root) as c:r=c.execute('SELECT genesis FROM founding WHERE slot=1').fetchone()
    cross.need(r is not None,'No adopted ancestry');cross.write_new(out,r[0])

def verify_genesis(root,path):
    obj=read(path)
    with cross.journal(root) as c:b=cross.verify(c,obj,'genesis')
    cross.need(set(b)=={'schema','kind','sender','recipient','seed','created','law'} and b['law']==LAW and b['recipient']==me(root) and type(b['created']) is int,'Invalid genesis')
    with ancestry(root) as c:
        c.execute('BEGIN IMMEDIATE');r=c.execute('SELECT envelope,genesis FROM seeds WHERE id=?',(b['seed'],)).fetchone();cross.need(r is not None,'Unknown original seed')
        s=cross.parse(r[0])['body'];cross.need(s['recipient']==b['sender'] and s['created']-300<=b['created']<=s['expires'] and b['created']<=int(time.time())+300,'Wrong genesis signer/time')
        if r[1]:cross.need(cross.parse(r[1])['id']==obj['id'],'Conflicting genesis');return obj['id']
        c.execute('UPDATE seeds SET genesis=? WHERE id=?',(cross.canonical(obj),b['seed']))
    return obj['id']

def status(root):
    with ancestry(root) as c:
        r=c.execute('SELECT seed,genesis FROM founding WHERE slot=1').fetchone(); n=c.execute('SELECT count(*) FROM seeds WHERE genesis IS NOT NULL').fetchone()[0]
    return {'fingerprint':me(root),'ancestry_seed':cross.parse(r[0])['id'] if r else None,'genesis':cross.parse(r[1])['id'] if r else None,'acknowledged_descendants':n,'authority':'local only'}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--data',type=Path,default=Path('caravan-data'));s=p.add_subparsers(dest='cmd',required=True)
    x=s.add_parser('found');x.add_argument('name');x=s.add_parser('invite');x.add_argument('recipient');x.add_argument('out',type=Path);x.add_argument('--ttl',type=int,default=86400)
    x=s.add_parser('adopt');x.add_argument('file',type=Path);x.add_argument('--confirm-local',action='store_true')
    x=s.add_parser('genesis');x.add_argument('out',type=Path);x=s.add_parser('verify-genesis');x.add_argument('file',type=Path);s.add_parser('status');a=p.parse_args();r=a.data
    try:
        if a.cmd=='found': print(fresh(r,a.name))
        elif a.cmd=='invite': print(invite(r,a.recipient,a.out,a.ttl))
        elif a.cmd=='adopt': print(adopt(r,a.file,a.confirm_local))
        elif a.cmd=='genesis':genesis(r,a.out)
        elif a.cmd=='verify-genesis':print(verify_genesis(r,a.file))
        elif a.cmd=='status':print(json.dumps(status(r),indent=2))
    except Exception as e:print('HOLD:',str(e) or type(e).__name__,file=sys.stderr);return 1
    return 0
if __name__=='__main__':sys.exit(main())

#!/usr/bin/env python3
"""CARAVAN 004: offline signed review parcels. Not native reLATTE wire format."""
import argparse, hashlib, json, os, re, sqlite3, sys, time, uuid, zipfile
from pathlib import Path
from contextlib import contextmanager
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.exceptions import InvalidSignature
import caravan as media
import library as shelf
MAX=media.MAX
HEX=re.compile(r'^[0-9a-f]{64}$')
SCHEMA='caravan.crossing/v1'

def need(ok,msg):
    if not ok: raise ValueError(msg)
def sha(b): return hashlib.sha256(b).hexdigest()
def canonical(obj): return json.dumps(obj,sort_keys=True,separators=(',',':'),ensure_ascii=True,allow_nan=False).encode('ascii')
def parse(b):
    def pairs(p):
        d=dict(p);need(len(d)==len(p),'Duplicate JSON key');return d
    return json.loads(b,object_pairs_hook=pairs)
def public(key): return key.public_bytes(serialization.Encoding.DER,serialization.PublicFormat.SubjectPublicKeyInfo)
def fingerprint(key): return sha(public(key))
def pub(b):
    key=serialization.load_der_public_key(b);need(isinstance(key,ec.EllipticCurvePublicKey) and isinstance(key.curve,ec.SECP256R1),'P-256 required');return key
@contextmanager
def journal(root):
    root.mkdir(parents=True,exist_ok=True)
    c=sqlite3.connect(root/'crossings.sqlite')
    try:
        c.execute('CREATE TABLE IF NOT EXISTS peers(id TEXT PRIMARY KEY, key BLOB NOT NULL)')
        c.execute('CREATE TABLE IF NOT EXISTS outgoing(id TEXT PRIMARY KEY, envelope BLOB NOT NULL, response BLOB)')
        c.execute('CREATE TABLE IF NOT EXISTS incoming(id TEXT PRIMARY KEY, envelope BLOB NOT NULL, payload BLOB NOT NULL, state TEXT NOT NULL, receipt BLOB NOT NULL)')
        with c: yield c
    finally: c.close()
def identity(root):
    key=serialization.load_pem_private_key((root/'crossing-key.pem').read_bytes(),password=None)
    need(isinstance(key,ec.EllipticCurvePrivateKey) and isinstance(key.curve,ec.SECP256R1),'P-256 required');return key
def init(root):
    root.mkdir(parents=True,exist_ok=True);p=root/'crossing-key.pem'
    if not p.exists():
        key=ec.generate_private_key(ec.SECP256R1());b=key.private_bytes(serialization.Encoding.PEM,serialization.PrivateFormat.PKCS8,serialization.NoEncryption())
        fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
        with os.fdopen(fd,'wb') as f:f.write(b);f.flush();os.fsync(f.fileno())
    return fingerprint(identity(root).public_key())
def card(root,out):
    k=identity(root).public_key(); write_new(out,canonical({'schema':'caravan.peer/v1','fingerprint':fingerprint(k),'public_key':public(k).hex()}))
def write_new(path,data):
    with path.open('xb') as f:f.write(data)
def bounded(path,limit):
    need(0<path.stat().st_size<=limit,'File size limit');b=path.read_bytes();need(len(b)<=limit,'File grew');return b
def pin(root,path,expected):
    x=parse(bounded(path,4096));need(set(x)=={'schema','fingerprint','public_key'} and x['schema']=='caravan.peer/v1','Bad peer card')
    k=pub(bytes.fromhex(x['public_key']));f=fingerprint(k);need(f==expected==x['fingerprint'],'Verify fingerprint independently before pinning');need(f!=fingerprint(identity(root).public_key()),'Cannot pin self')
    with journal(root) as c:c.execute('INSERT OR IGNORE INTO peers VALUES (?,?)',(f,public(k)))
    return f
def pinned(c,f):
    need(isinstance(f,str) and HEX.fullmatch(f),'Bad peer ID');r=c.execute('SELECT key FROM peers WHERE id=?',(f,)).fetchone();need(r is not None,'Unpinned peer');return pub(r[0])
def sign(key,body):
    b=canonical(body);ident=sha(b'CARAVAN-004\x00'+b);sig=key.sign(b'CARAVAN-004\x00'+b,ec.ECDSA(hashes.SHA256()));return {'body':body,'id':ident,'signature':sig.hex()}
def verify(c,obj,kind):
    need(isinstance(obj,dict) and set(obj)=={'body','id','signature'},'Bad envelope');b=obj['body'];need(isinstance(b,dict) and b.get('schema')==SCHEMA and b.get('kind')==kind,'Bad schema/kind');raw=b'CARAVAN-004\x00'+canonical(b);need(sha(raw)==obj['id'],'Envelope ID mismatch');k=pinned(c,b.get('sender'));k.verify(bytes.fromhex(obj['signature']),raw,ec.ECDSA(hashes.SHA256()));return b

def offer(root,kind,ident,recipient,out,confirm=False,ttl=86400):
    need(confirm,'Explicit public-safe external review permission required');need(1<=ttl<=604800,'Expiry must be 1–604800 seconds')
    key=identity(root);sender=fingerprint(key.public_key());need(sender!=recipient,'Independent recipient required')
    if kind=='audio':
        r=media.item(root,ident);need(r[7] and r[8]=='OWNED','Media review permission missing');data=media.media_bytes(root,r);title,credit,ext=r[1],r[2],r[3];rights='Operator declared review-only permission'
    elif kind=='document':
        r=shelf.item(root,ident);data=shelf.bytes_for(root,r);title,credit,ext,rights=r['title'],r['credit'],r['ext'],r['rights']
    else:raise ValueError('Unknown content kind')
    now=int(time.time());body={'schema':SCHEMA,'kind':'offer','sender':sender,'recipient':recipient,'nonce':uuid.uuid4().hex,'created':now,'expires':now+ttl,'scope':'review-only','content_kind':kind,'title':title,'credit':credit,'rights':rights,'ext':ext,'sha256':sha(data),'size':len(data)}
    obj=sign(key,body);raw=canonical(obj)
    with journal(root) as c:
        pinned(c,recipient);c.execute('INSERT INTO outgoing VALUES (?,?,NULL)',(obj['id'],raw))
        with zipfile.ZipFile(out,'x',compression=zipfile.ZIP_STORED) as z:z.writestr('envelope.json',raw);z.writestr('payload',data)
    return obj['id']
def read_parcel(path):
    need(path.stat().st_size<=MAX+32768,'Parcel exceeds limit')
    with zipfile.ZipFile(path) as z:
        need(len(z.infolist())==2 and set(z.namelist())=={'envelope.json','payload'},'Unexpected parcel members')
        need(0<z.getinfo('envelope.json').file_size<=16384 and 0<z.getinfo('payload').file_size<=MAX,'Parcel limits');return parse(z.read('envelope.json')),z.read('payload')
def response(key,b,offer_id,state):
    return sign(key,{'schema':SCHEMA,'kind':'receipt','sender':fingerprint(key.public_key()),'recipient':b['sender'],'offer':offer_id,'state':state,'created':int(time.time())})
def receive(root,path):
    obj,data=read_parcel(path);key=identity(root);me=fingerprint(key.public_key())
    with journal(root) as c:
        b=verify(c,obj,'offer');need(set(b)=={'schema','kind','sender','recipient','nonce','created','expires','scope','content_kind','title','credit','rights','ext','sha256','size'},'Unexpected offer fields');need(b['recipient']==me and b['sender']!=me and b['scope']=='review-only','Wrong recipient or scope')
        need(type(b['created']) is int and type(b['expires']) is int and 0<b['expires']-b['created']<=604800,'Invalid timestamps');need(type(b['size']) is int and b['size']==len(data) and b['sha256']==sha(data),'Payload mismatch');need(isinstance(b['nonce'],str) and media.ID.fullmatch(b['nonce']),'Bad nonce')
        for f in ('title','credit','rights'):media.clean(b[f])
        need((b['content_kind']=='audio' and b['ext'] in media.TYPES) or (b['content_kind']=='document' and b['ext'] in shelf.FORMATS),'Unsupported content')
        c.execute('BEGIN IMMEDIATE');old=c.execute('SELECT state FROM incoming WHERE id=?',(obj['id'],)).fetchone()
        if old:return obj['id'],old[0]
        now=int(time.time());need(b['created']<=now+300 and now<=b['expires'],'Expired or future offer');receipt=response(key,b,obj['id'],'HOLD');c.execute('INSERT INTO incoming VALUES (?,?,?,?,?)',(obj['id'],canonical(obj),data,'HOLD',canonical(receipt)))
    return obj['id'],'HOLD'
def refuse(root,ident):
    key=identity(root)
    with journal(root) as c:
        c.execute('BEGIN IMMEDIATE');r=c.execute('SELECT envelope,state FROM incoming WHERE id=?',(ident,)).fetchone();need(r is not None,'Unknown incoming offer')
        if r[1]=='REFUSE':return
        b=parse(r[0])['body'];receipt=response(key,b,ident,'REFUSE');c.execute('UPDATE incoming SET state=?,receipt=?,payload=? WHERE id=?',('REFUSE',canonical(receipt),b'',ident))
def inspect_payload(root,ident,out):
    with journal(root) as c:
        r=c.execute('SELECT envelope,payload,state FROM incoming WHERE id=?',(ident,)).fetchone();need(r is not None and r[2]=='HOLD','Only held material can be reviewed');obj=parse(r[0]);b=verify(c,obj,'offer');need(len(r[1])==b['size'] and sha(r[1])==b['sha256'],'Stored payload mismatch');need(out.suffix.lower()==b['ext'],'Use matching file extension');write_new(out,r[1])
def receipt(root,ident,out):
    with journal(root) as c:r=c.execute('SELECT receipt FROM incoming WHERE id=?',(ident,)).fetchone();need(r is not None,'Unknown incoming offer');write_new(out,r[0])
def verify_receipt(root,path):
    obj=parse(bounded(path,16384));me=fingerprint(identity(root).public_key())
    with journal(root) as c:
        b=verify(c,obj,'receipt');need(set(b)=={'schema','kind','sender','recipient','offer','state','created'} and b['recipient']==me and b['state'] in ('HOLD','REFUSE') and type(b['created']) is int,'Bad receipt')
        c.execute('BEGIN IMMEDIATE');r=c.execute('SELECT envelope,response FROM outgoing WHERE id=?',(b['offer'],)).fetchone();need(r is not None,'Unknown original offer');original=parse(r[0])['body'];need(original['recipient']==b['sender'],'Wrong receipt signer')
        if r[1] and parse(r[1])['body']['state']=='REFUSE':return 'REFUSE'
        c.execute('UPDATE outgoing SET response=? WHERE id=?',(canonical(obj),b['offer']));return b['state']
def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--data',type=Path,default=Path('caravan-data'));s=p.add_subparsers(dest='cmd',required=True);s.add_parser('init');s.add_parser('list')
    x=s.add_parser('card');x.add_argument('out',type=Path)
    x=s.add_parser('pin');x.add_argument('card',type=Path);x.add_argument('fingerprint')
    x=s.add_parser('offer');x.add_argument('kind',choices=['audio','document']);x.add_argument('id');x.add_argument('recipient');x.add_argument('out',type=Path);x.add_argument('--confirm-review',action='store_true');x.add_argument('--ttl',type=int,default=86400)
    for name in ('receive','verify-receipt'):x=s.add_parser(name);x.add_argument('file',type=Path)
    x=s.add_parser('refuse');x.add_argument('id')
    for name in ('receipt','inspect'):
        x=s.add_parser(name);x.add_argument('id');x.add_argument('out',type=Path)
    a=p.parse_args();r=a.data
    try:
        if a.cmd=='init':print(init(r))
        elif a.cmd=='card':card(r,a.out)
        elif a.cmd=='pin':print(pin(r,a.card,a.fingerprint))
        elif a.cmd=='offer':print(offer(r,a.kind,a.id,a.recipient,a.out,a.confirm_review,a.ttl))
        elif a.cmd=='receive':print(*receive(r,a.file))
        elif a.cmd=='refuse':refuse(r,a.id)
        elif a.cmd=='receipt':receipt(r,a.id,a.out)
        elif a.cmd=='inspect':inspect_payload(r,a.id,a.out)
        elif a.cmd=='verify-receipt':print(verify_receipt(r,a.file))
        elif a.cmd=='list':
            with journal(r) as c:
                for row in c.execute('SELECT id,state FROM incoming'):print('IN',*row)
                for row in c.execute('SELECT id,response FROM outgoing'):print('OUT',row[0],parse(row[1])['body']['state'] if row[1] else 'UNCONFIRMED')
    except (ValueError,OSError,sqlite3.Error,zipfile.BadZipFile,InvalidSignature,KeyError,TypeError,AttributeError) as e:print('HOLD:',str(e) or type(e).__name__,file=sys.stderr);return 1
    return 0
if __name__=='__main__':sys.exit(main())

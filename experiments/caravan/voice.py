#!/usr/bin/env python3
"""CARAVAN 002: recording-first private archive and Static Live receipt handoff."""
import argparse, hashlib, json, os, shutil, subprocess, sys, tempfile, uuid
from pathlib import Path
import caravan as c

FORMATS={'.mkv','.mp4','.mov','.webm','.wav','.mp3','.m4a','.ogg','.flac'}
RECEIPT='static-live.broadcast-receipt/v0.1'

def validate_receipt(receipt, source):
    c.require(isinstance(receipt,dict) and receipt.get('version')==RECEIPT,'Unsupported Static Live receipt')
    c.require(isinstance(receipt.get('started'),dict) and receipt['started'].get('recording') is True,'Recording start not confirmed')
    c.require(isinstance(receipt.get('ended'),dict) and receipt['ended'].get('recording')=='confirmed-stopped','Recording stop not confirmed; finish recording first')
    path=receipt.get('recordingOutputPath')
    c.require(isinstance(path,str) and bool(path) and Path(path).is_absolute() and Path(path).resolve()==source.resolve(),'Receipt path does not match explicitly selected source; use manual mode for moved files')
    c.clean(receipt.get('eventId'))
    c.require(isinstance(receipt.get('faults'),list) and all(isinstance(f,str) for f in receipt['faults']),'Invalid faults')
    # No air claim is derived from any receipt, even if stream start was confirmed.
    return {'kind':'static-live-receipt','event':receipt['eventId'],'reported_stream_start':receipt['started'].get('stream') is True,'reported_stream_end':receipt['ended'].get('stream'),'fault_count':len(receipt['faults']),'authority':'operator-selected unsigned receipt; no proof of consent or airtime'}

def filehash(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''): h.update(block)
    return h.hexdigest()

def write_json(path, obj):
    with tempfile.NamedTemporaryFile('w',dir=path.parent,delete=False,encoding='utf-8') as f:
        temp=Path(f.name)
        try:
            json.dump(obj,f,indent=2);f.flush();os.fsync(f.fileno())
        except BaseException:
            temp.unlink(missing_ok=True);raise
    os.replace(temp,path)

def preserve(root,source,title,attribution,receipt=None,confirmed=False):
    c.require(confirmed,'Explicit confirmation of finalized recording and permission to preserve privately required')
    c.clean(title);c.clean(attribution)
    source=source.resolve();c.require(source.is_file() and source.suffix.lower() in FORMATS,'Unsupported recording file')
    facts=validate_receipt(receipt,source) if receipt is not None else {'kind':'manual','authority':'operator declaration; no verified recording or consent'}
    archive=root/'recordings';archive.mkdir(parents=True,exist_ok=True)
    ident=uuid.uuid4().hex;stage=archive/('.pending-'+ident);stage.mkdir(mode=0o700)
    original=stage/('original'+source.suffix.lower())
    before=source.stat();c.require(before.st_size>0,'Empty recording')
    try:
        shutil.copyfile(source,original)
        with original.open('rb') as f: os.fsync(f.fileno())
        sha=filehash(original);after=source.stat()
        c.require((before.st_size,before.st_mtime_ns)==(after.st_size,after.st_mtime_ns) and original.stat().st_size==before.st_size and filehash(source)==sha,'Source changed during preservation')
        record={'schema':'caravan.recording/v0','id':ident,'title':title,'attribution':attribution,'original':original.name,'sha256':sha,'size':before.st_size,'source':facts,'publication':'PRIVATE','projection':None}
        if receipt is not None: write_json(stage/'source-receipt.json',receipt)
        write_json(stage/'record.json',record)
        os.rename(stage,archive/ident)
    except BaseException:
        shutil.rmtree(stage,ignore_errors=True);raise
    return ident

def load(root,ident):
    c.require(c.ID.fullmatch(ident),'Bad recording ID')
    folder=root/'recordings'/ident
    record=json.loads((folder/'record.json').read_text(encoding='utf-8'))
    c.require(record.get('id')==ident and record.get('schema')=='caravan.recording/v0','Bad archive manifest')
    name=record.get('original');c.require(name in {'original'+x for x in FORMATS},'Invalid original filename')
    original=folder/name
    c.require(original.is_file() and original.stat().st_size==record['size'] and filehash(original)==record['sha256'],'Original missing or digest mismatch')
    return folder,record,original

def project(root,ident,ffmpeg='ffmpeg'):
    folder,record,source=load(root,ident)
    c.require(record['projection'] is None,'Already projected; inspect recording record')
    with tempfile.TemporaryDirectory(prefix='voice-',dir=folder) as temp:
        out=Path(temp)/'listening.mp3'
        subprocess.run([ffmpeg,'-nostdin','-hide_banner','-loglevel','error','-protocol_whitelist','file,pipe','-i',str(source),'-map','0:a:0','-vn','-map_metadata','-1','-map_chapters','-1','-ac','1','-ar','44100','-c:a','libmp3lame','-b:a','96k',str(out)],check=True,timeout=300,capture_output=True)
        c.require(out.is_file() and 0<out.stat().st_size<=c.MAX,'Projection exceeds First Signal media limit; original preserved')
        data=out.read_bytes();sha=c.digest(data)
        # Existing catalog duplicate is not automatically admitted or linked.
        media=c.put(root,data,'.mp3',record['title'],record['attribution'])
        record['projection']={'media_id':media,'sha256':sha,'type':'audio/mp3','initial_permissions':[],'recipe':'mono 44100 Hz 96 kbps MP3; first audio track'}
        write_json(folder/'record.json',record)
    return media

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--data',type=Path,default=Path('caravan-data'));s=p.add_subparsers(dest='cmd',required=True)
    a=s.add_parser('preserve');a.add_argument('file',type=Path);a.add_argument('--title',required=True);a.add_argument('--attribution',required=True);a.add_argument('--receipt',type=Path);a.add_argument('--confirmed-private-preservation',action='store_true')
    a=s.add_parser('project');a.add_argument('id');a.add_argument('--ffmpeg',default='ffmpeg')
    a=s.add_parser('verify');a.add_argument('id');s.add_parser('list')
    args=p.parse_args();root=args.data
    try:
        if args.cmd=='preserve':
            receipt=None
            if args.receipt:
                c.require(args.receipt.stat().st_size<=1024*1024,'Receipt too large');receipt=json.loads(args.receipt.read_text(encoding='utf-8'));c.require(isinstance(receipt,dict),'Receipt must be object')
            print(preserve(root,args.file,args.title,args.attribution,receipt,args.confirmed_private_preservation))
        elif args.cmd=='project': print(project(root,args.id,args.ffmpeg))
        elif args.cmd=='verify': print(json.dumps(load(root,args.id)[1],indent=2))
        else:
            for d in sorted((root/'recordings').glob('*')):
                if c.ID.fullmatch(d.name):
                    try: print(d.name,load(root,d.name)[1]['title'],'VERIFIED PRIVATE ORIGINAL',sep=' | ')
                    except (OSError,ValueError,KeyError): print(d.name,'HOLD: verification failed')
                elif d.name.startswith('.pending-'): print(d.name,'HOLD: interrupted archive; inspect manually')
    except (ValueError,OSError,KeyError,TypeError,subprocess.SubprocessError) as e:
        print('HOLD:',e,'(source recording is never deleted)',file=sys.stderr);return 1
    return 0
if __name__=='__main__':sys.exit(main())

import tempfile, unittest, threading, urllib.request, urllib.error
from pathlib import Path
from unittest.mock import patch
import caravan as m, crossing as x, airwaves as a
class AirwavesTests(unittest.TestCase):
 def setUp(self):
  self.t=tempfile.TemporaryDirectory();self.addCleanup(self.t.cleanup);self.p=Path(self.t.name);self.a=self.p/'a';self.b=self.p/'b';self.id=m.demo(self.a);a.station(self.a,'Local One');a.station(self.a,'Local Two');a.station(self.b,'Station review')
 def offer(self):
  fa=x.init(self.a);fb=x.init(self.b);x.card(self.a,self.p/'a.json');x.card(self.b,self.p/'b.json');x.pin(self.a,self.p/'b.json',fb);x.pin(self.b,self.p/'a.json',fa);z=self.p/'offer.zip';oid=x.offer(self.a,'audio',self.id,fb,z,True);x.receive(self.b,z);return oid
 def test_independent_lineups_and_restart(self):
  a.replace(self.a,'Local One',[self.id,self.id]);a.replace(self.a,'Local Two',[self.id]);self.assertEqual(len(a.lineup(self.a,'Local One')),2);self.assertEqual(len(a.lineup(self.a,'Local Two')),1)
 def test_private_rejected(self):
  i=m.put(self.a,b'private','.mp3','private','credit')
  with self.assertRaises(ValueError):a.replace(self.a,'Local One',[i])
 def test_revocation_filters(self):
  a.replace(self.a,'Local One',[self.id]);m.permission(self.a,self.id,'local',False);self.assertEqual(a.lineup(self.a,'Local One'),[])
 def test_invalid_replace_keeps_old(self):
  a.replace(self.a,'Local One',[self.id]);
  with self.assertRaises(ValueError):a.replace(self.a,'Local One',['invalid'])
  self.assertEqual(len(a.lineup(self.a,'Local One')),1)
 def test_review_stays_private(self):
  oid=self.offer();r=a.stage(self.b,'Station review',oid);self.assertEqual(r['airtime'],'NOT_AUTHORIZED');a.stage(self.b,'Station review',oid);self.assertEqual(len(a.review(self.b,'Station review')),1);self.assertEqual(a.lineup(self.b,'Station review'),[]);self.assertNotIn(b'First Signal (synthetic tone)',m.page(self.b))
 def test_refusal_blocks_review(self):
  oid=self.offer();a.stage(self.b,'Station review',oid);x.refuse(self.b,oid);self.assertEqual(a.review(self.b,'Station review')[0]['status'],'BLOCKED')
 def test_expiry_blocks_review(self):
  oid=self.offer();r=a.stage(self.b,'Station review',oid)
  with patch('airwaves.time.time',return_value=r['expires']+1):self.assertEqual(a.review(self.b,'Station review')[0]['status'],'BLOCKED')
 def test_corrupted_payload_blocks_review(self):
  oid=self.offer();a.stage(self.b,'Station review',oid)
  with x.journal(self.b) as c:c.execute('UPDATE incoming SET payload=? WHERE id=?',(b'bad',oid))
  self.assertEqual(a.review(self.b,'Station review')[0]['status'],'BLOCKED')
 def test_corrupted_signature_blocks_review(self):
  oid=self.offer();a.stage(self.b,'Station review',oid)
  with x.journal(self.b) as c:
   raw=c.execute('SELECT envelope FROM incoming WHERE id=?',(oid,)).fetchone()[0];obj=x.parse(raw);obj['signature']='00';c.execute('UPDATE incoming SET envelope=? WHERE id=?',(x.canonical(obj),oid))
  self.assertEqual(a.review(self.b,'Station review')[0]['status'],'BLOCKED')
 def test_http(self):
  a.replace(self.a,'Local One',[self.id]);srv=m.ThreadingHTTPServer(('127.0.0.1',0),m.handler(self.a));t=threading.Thread(target=srv.serve_forever,daemon=True);t.start();url=f'http://127.0.0.1:{srv.server_port}'
  try:
   self.assertIn(b'Local radio',urllib.request.urlopen(url).read());r=urllib.request.urlopen(url+'/radio?station=Local%20One');self.assertIn("script-src 'self'",r.headers['Content-Security-Policy']);self.assertIn(b'First Signal',r.read());self.assertIn(b'addEventListener',urllib.request.urlopen(url+'/radio.js').read());
   for path in ('/review','/airwaves.sqlite','/radio?station=missing'):
    with self.assertRaises(urllib.error.HTTPError):urllib.request.urlopen(url+path)
  finally:srv.shutdown();srv.server_close();t.join()
if __name__=='__main__':unittest.main()

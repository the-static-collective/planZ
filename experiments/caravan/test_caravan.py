import unittest,tempfile,threading,urllib.request,urllib.error,zipfile,json
from pathlib import Path
import caravan as c
class FieldTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.a=Path(self.tmp.name)/'a';self.b=Path(self.tmp.name)/'b';self.id=c.demo(self.a);self.out=Path(self.tmp.name)/'parcel.zip'
 def tearDown(self):self.tmp.cleanup()
 def test_private_default(self):
  ident=c.put(self.a,b'fixture','.mp3','Private','Test');self.assertNotIn(b'Private',c.page(self.a));self.assertFalse(c.item(self.a,ident)[7])
 def test_export_receive_refuse(self):
  c.export(self.a,self.id,'B',self.out);ident=c.receive(self.b,self.out,'B');self.assertEqual(c.item(self.b,ident)[8],'HOLD');self.assertNotIn(b'First Signal (synthetic tone)',c.page(self.b));
  with self.assertRaises(ValueError):c.permission(self.b,ident,'local',True)
  c.refuse(self.b,ident);self.assertEqual(c.item(self.b,ident)[8],'REFUSED')
 def test_wrong_recipient(self):
  c.export(self.a,self.id,'B',self.out)
  with self.assertRaises(ValueError):c.receive(self.b,self.out,'C')
 def test_revoke(self):
  c.permission(self.a,self.id,'review',False)
  with self.assertRaises(ValueError):c.export(self.a,self.id,'B',self.out)
 def test_duplicate(self):
  with self.assertRaises(ValueError):c.demo(self.a)
 def test_tamper(self):
  c.export(self.a,self.id,'B',self.out);bad=self.out.with_name('bad.zip')
  with zipfile.ZipFile(self.out) as z,zipfile.ZipFile(bad,'w') as w:
   w.writestr('manifest.json',z.read('manifest.json'));w.writestr('audio.wav',b'tampered')
  with self.assertRaises(ValueError):c.receive(self.b,bad,'B')
 def test_restart_and_guest_http(self):
  srv=c.ThreadingHTTPServer(('127.0.0.1',0),c.handler(self.a));t=threading.Thread(target=srv.serve_forever,daemon=True);t.start();url=f'http://127.0.0.1:{srv.server_port}'
  try:
   self.assertIn(b'First Signal (synthetic tone)',urllib.request.urlopen(url).read());self.assertEqual(urllib.request.urlopen(url+'/audio/'+self.id).read()[:4],b'RIFF')
   c.permission(self.a,self.id,'local',False)
   for path in ('/audio/'+self.id,'/catalog.sqlite','/../catalog.sqlite'):
    with self.assertRaises(urllib.error.HTTPError) as e:urllib.request.urlopen(url+path)
    self.assertEqual(e.exception.code,404)
   self.assertNotIn(b'First Signal (synthetic tone)',urllib.request.urlopen(url).read())
  finally:srv.shutdown();srv.server_close();t.join()
if __name__=='__main__':unittest.main()

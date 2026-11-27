import tempfile, unittest, threading, urllib.request, urllib.error, shutil
from pathlib import Path
import library as l
import caravan as c

class LibraryTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(); self.root=Path(self.tmp.name)/'host'; self.file=Path(self.tmp.name)/'guide.md';self.file.write_text('Hello <script>alert(1)</script>\nCommunity repair guide',encoding='utf-8')
        self.id=l.add(self.root,self.file,'Repair <guide>','Fixture author','Original fixture','Workshop','Tools and maintenance')
    def tearDown(self):self.tmp.cleanup()
    def test_private(self):
        self.assertEqual(l.search(self.root),[]);self.assertNotIn(b'Repair &lt;guide&gt;',c.page(self.root))
        with self.assertRaises(ValueError):l.guest(self.root,self.id)
    def test_search(self):
        l.permit(self.root,self.id,True);self.assertEqual(len(l.search(self.root,'REPAIR tools','Workshop')),1);self.assertEqual(l.search(self.root,'repair','Church'),[]);self.assertEqual(l.search(self.root,'absent'),[])
    def test_revoke(self):
        l.permit(self.root,self.id,True);l.permit(self.root,self.id,False)
        with self.assertRaises(ValueError):l.guest(self.root,self.id,True)
    def test_digest_tamper(self):
        l.permit(self.root,self.id,True);p=self.root/'documents'/(self.id+'.md');p.write_bytes(b'x'*p.stat().st_size)
        with self.assertRaises(ValueError):l.guest(self.root,self.id)
    def test_duplicate(self):
        with self.assertRaises(Exception) as e:l.add(self.root,self.file,'Other','Author','Rights','Library')
        self.assertIn('UNIQUE',str(e.exception));self.assertEqual(len(list((self.root/'documents').iterdir())),1)
    def test_active_html_denied(self):
        p=self.file.with_suffix('.html');p.write_text('<script>bad</script>')
        with self.assertRaises(ValueError):l.add(self.root,p,'Bad','Author','Rights','Library')
    def test_rights_required(self):
        with self.assertRaises(ValueError):l.add(self.root,self.file,'Guide','Author','','Library')
    def test_backup_restore(self):
        l.permit(self.root,self.id,True);dest=self.root.with_name('restored');shutil.copytree(self.root,dest);self.assertEqual(l.guest(dest,self.id)[0],self.file.read_bytes())
    def test_http(self):
        srv=c.ThreadingHTTPServer(('127.0.0.1',0),c.handler(self.root));t=threading.Thread(target=srv.serve_forever,daemon=True);t.start();url=f'http://127.0.0.1:{srv.server_port}'
        try:
            for route in ['/document/'+self.id,'/read/'+self.id,'/documents/'+self.id+'.md']:
                with self.assertRaises(urllib.error.HTTPError) as e:urllib.request.urlopen(url+route)
                self.assertEqual(e.exception.code,404)
            l.permit(self.root,self.id,True)
            with urllib.request.urlopen(url+'/?q=repair&category=Workshop') as r:self.assertIn(b'Repair &lt;guide&gt;',r.read())
            with urllib.request.urlopen(url+'/read/'+self.id) as r:
                data=r.read();self.assertIn(b'&lt;script&gt;',data);self.assertNotIn(b'<script>',data)
            with urllib.request.urlopen(url+'/document/'+self.id) as r:self.assertEqual(r.read(),self.file.read_bytes());self.assertIn('attachment',r.headers['Content-Disposition'])
            l.permit(self.root,self.id,False)
            with self.assertRaises(urllib.error.HTTPError):urllib.request.urlopen(url+'/document/'+self.id)
        finally:srv.shutdown();srv.server_close();t.join()
    def test_pdf_epub_download_only(self):
        for ext,fixture in [('.pdf',b'%PDF-1.7\nfixture header'),('.epub',b'PK\x03\x04fixture header')]:
            p=self.file.with_suffix(ext);p.write_bytes(fixture);i=l.add(self.root,p,'Sample','Fixture','Original','Library');l.permit(self.root,i,True)
            self.assertEqual(l.guest(self.root,i)[0],fixture);self.assertIn('attachment',l.guest(self.root,i)[2])
            with self.assertRaises(ValueError):l.guest(self.root,i,True)
if __name__=='__main__':unittest.main()

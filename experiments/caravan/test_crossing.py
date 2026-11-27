import tempfile, unittest, zipfile
from pathlib import Path
from unittest.mock import patch
from cryptography.exceptions import InvalidSignature
import crossing as x, caravan as m, library as l

class CrossingTests(unittest.TestCase):
    def setUp(self):
        self.t=tempfile.TemporaryDirectory();self.addCleanup(self.t.cleanup);self.p=Path(self.t.name);self.a=self.p/'a';self.b=self.p/'b';self.c=self.p/'c';self.fa=x.init(self.a);self.fb=x.init(self.b);self.fc=x.init(self.c)
        for root,n in [(self.a,'a'),(self.b,'b'),(self.c,'c')]:x.card(root,self.p/(n+'.json'))
        x.pin(self.a,self.p/'b.json',self.fb);x.pin(self.b,self.p/'a.json',self.fa);x.pin(self.c,self.p/'a.json',self.fa);self.mid=m.demo(self.a);self.z=self.p/'offer.zip'
    def offer(self,**kw):return x.offer(self.a,'audio',self.mid,self.fb,self.z,True,**kw)
    def rewrite(self,change):
        obj,data=x.read_parcel(self.z);obj,data=change(obj,data);p=self.p/'bad.zip'
        with zipfile.ZipFile(p,'w') as z:z.writestr('envelope.json',x.canonical(obj));z.writestr('payload',data)
        return p
    def test_independent_identity_and_restart(self):self.assertNotEqual(self.fa,self.fb);self.assertEqual(x.init(self.a),self.fa)
    def test_wrong_fingerprint(self):
        with self.assertRaises(ValueError):x.pin(self.a,self.p/'c.json',self.fb)
    def test_hold_roundtrip_and_refusal_monotonic(self):
        i=self.offer();self.assertEqual(x.receive(self.b,self.z),(i,'HOLD'));h=self.p/'hold.json';x.receipt(self.b,i,h);self.assertEqual(x.verify_receipt(self.a,h),'HOLD');x.refuse(self.b,i);r=self.p/'refuse.json';x.receipt(self.b,i,r);self.assertEqual(x.verify_receipt(self.a,r),'REFUSE');self.assertEqual(x.verify_receipt(self.a,h),'REFUSE');self.assertEqual(x.receive(self.b,self.z),(i,'REFUSE'))
    def test_private_review_and_no_public_catalog(self):
        i=self.offer();x.receive(self.b,self.z);self.assertNotIn(b'First Signal (synthetic tone)',m.page(self.b));p=self.p/'review.wav';x.inspect_payload(self.b,i,p);self.assertEqual(p.read_bytes(),m.media_bytes(self.a,m.item(self.a,self.mid)));x.refuse(self.b,i)
        with self.assertRaises(ValueError):x.inspect_payload(self.b,i,self.p/'no.wav')
    def test_document(self):
        p=self.p/'guide.txt';p.write_text('public-safe fixture');i=l.add(self.a,p,'Guide','Test author','Permission for review','Repair');oid=x.offer(self.a,'document',i,self.fb,self.z,True);self.assertEqual(x.receive(self.b,self.z),(oid,'HOLD'));self.assertEqual(l.search(self.b),[]);out=self.p/'review.txt';x.inspect_payload(self.b,oid,out);self.assertEqual(out.read_bytes(),p.read_bytes())
    def test_missing_confirm_and_revoked(self):
        with self.assertRaises(ValueError):x.offer(self.a,'audio',self.mid,self.fb,self.z)
        m.permission(self.a,self.mid,'review',False)
        with self.assertRaises(ValueError):self.offer()
    def test_wrong_recipient(self):
        self.offer()
        with self.assertRaises(ValueError):x.receive(self.c,self.z)
    def test_unknown_sender(self):
        self.offer();d=self.p/'d';x.init(d)
        with self.assertRaisesRegex(ValueError,'Unpinned'):x.receive(d,self.z)
    def test_changed_payload(self):
        self.offer();p=self.rewrite(lambda o,d:(o,d[:-1]+bytes([d[-1]^1])))
        with self.assertRaisesRegex(ValueError,'Payload mismatch'):x.receive(self.b,p)
    def test_changed_metadata_and_rehashed(self):
        self.offer()
        def change(o,d):o['body']['title']='forged';o['id']=x.sha(b'CARAVAN-004\x00'+x.canonical(o['body']));return o,d
        with self.assertRaises(InvalidSignature):x.receive(self.b,self.rewrite(change))
    def test_expired(self):
        with patch('crossing.time.time',return_value=1700000000):self.offer(ttl=5)
        with patch('crossing.time.time',return_value=1700000010):
            with self.assertRaisesRegex(ValueError,'Expired'):x.receive(self.b,self.z)
    def test_duplicate_idempotent(self):
        i=self.offer();x.receive(self.b,self.z);x.receive(self.b,self.z)
        with x.journal(self.b) as c:self.assertEqual(c.execute('SELECT count(*) FROM incoming').fetchone()[0],1)
    def test_wrong_receipt_signer(self):
        i=self.offer();x.pin(self.a,self.p/'c.json',self.fc);o,_=x.read_parcel(self.z);r=x.response(x.identity(self.c),o['body'],i,'REFUSE');p=self.p/'forged.json';p.write_bytes(x.canonical(r))
        with self.assertRaisesRegex(ValueError,'Wrong receipt signer'):x.verify_receipt(self.a,p)
    def test_unknown_zip_entry(self):
        self.offer()
        with zipfile.ZipFile(self.z,'a') as z:z.writestr('../evil','no')
        with self.assertRaises(ValueError):x.receive(self.b,self.z)
if __name__=='__main__':unittest.main()

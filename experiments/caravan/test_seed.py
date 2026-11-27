import json, tempfile, unittest
from pathlib import Path
import caravan as m, crossing as c, seed as s, library as l
from cryptography.exceptions import InvalidSignature

class SeedTests(unittest.TestCase):
    def setUp(self):
        self.t=tempfile.TemporaryDirectory();self.addCleanup(self.t.cleanup);self.p=Path(self.t.name)
        self.a=self.p/'a';self.b=self.p/'b';self.af=s.fresh(self.a,'Parent');self.bf=s.fresh(self.b,'Child')
        self.ac=self.p/'a.json';self.bc=self.p/'b.json';c.card(self.a,self.ac);c.card(self.b,self.bc)
        c.pin(self.a,self.bc,self.bf);c.pin(self.b,self.ac,self.af);self.offer=self.p/'seed.json'
    def invite(self):return s.invite(self.a,self.bf,self.offer)
    def test_independent(self):
        m.demo(self.a)
        with m.db(self.a) as db:db.execute('INSERT INTO events(text) VALUES (?)',('private test notice',))
        child=self.p/'fresh';cf=s.fresh(child,'Independent');self.assertNotIn(cf,[self.af,self.bf]);self.assertNotEqual((child/'crossing-key.pem').read_bytes(),(self.a/'crossing-key.pem').read_bytes())
        with m.db(child) as db:self.assertEqual(db.execute('SELECT count(*) FROM media').fetchone()[0],0);self.assertEqual(db.execute('SELECT count(*) FROM events').fetchone()[0],0)
        with c.journal(child) as db:self.assertEqual(db.execute('SELECT count(*) FROM peers').fetchone()[0],0)
    def test_no_overwrite(self):
        with self.assertRaises(ValueError):s.fresh(self.a,'Overwrite')
        self.assertEqual(s.me(self.a),self.af)
    def test_no_consent(self):
        self.invite()
        with self.assertRaises(ValueError):s.adopt(self.b,self.offer)
        self.assertIsNone(s.status(self.b)['genesis'])
    def test_roundtrip_and_replay(self):
        sid=self.invite();gid=s.adopt(self.b,self.offer,True);out=self.p/'gen.json';s.genesis(self.b,out)
        self.assertEqual(s.verify_genesis(self.a,out),gid);self.assertEqual(s.verify_genesis(self.a,out),gid);self.assertEqual(s.adopt(self.b,self.offer,True),gid)
        self.assertEqual(s.status(self.b)['ancestry_seed'],sid);self.assertEqual(s.status(self.a)['acknowledged_descendants'],1)
        self.assertEqual(s.status(self.b)['authority'],'local only')
    def test_wrong_recipient(self):
        self.invite();d=self.p/'d';s.fresh(d,'Other');c.pin(d,self.ac,self.af)
        with self.assertRaises(ValueError):s.adopt(d,self.offer,True)
    def test_tamper(self):
        self.invite();obj=json.loads(self.offer.read_text());obj['body']['law']='parent controls child';obj['id']=c.sha(b'CARAVAN-004\x00'+c.canonical(obj['body']));self.offer.write_bytes(c.canonical(obj))
        with self.assertRaises(InvalidSignature):s.adopt(self.b,self.offer,True)
    def test_unpinned(self):
        self.invite()
        with c.journal(self.b) as db:db.execute('DELETE FROM peers')
        with self.assertRaises(ValueError):s.adopt(self.b,self.offer,True)
    def test_second_seed_denied(self):
        self.invite();s.adopt(self.b,self.offer,True);other=self.p/'second';s.invite(self.a,self.bf,other)
        with self.assertRaises(ValueError):s.adopt(self.b,other,True)
    def test_parent_absent(self):
        self.invite();s.adopt(self.b,self.offer,True);self.a.rename(self.p/'unavailable')
        m.demo(self.b);self.assertIn(b'First Signal',m.page(self.b));self.assertEqual(s.status(self.b)['fingerprint'],self.bf)
    def test_resources_separate(self):
        ident=m.demo(self.a);self.invite();s.adopt(self.b,self.offer,True)
        parcel=self.p/'audio.zip';oid=c.offer(self.a,'audio',ident,self.bf,parcel,True);c.receive(self.b,parcel)
        self.assertNotIn(b'First Signal (synthetic tone)',m.page(self.b));c.refuse(self.b,oid)
        with c.journal(self.b) as db:self.assertEqual(db.execute('SELECT state FROM incoming WHERE id=?',(oid,)).fetchone()[0],'REFUSE')

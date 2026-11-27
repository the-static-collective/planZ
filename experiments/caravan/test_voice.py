import tempfile,unittest,shutil,subprocess,json
from pathlib import Path
import voice as v, caravan as c
class VoiceTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.base=Path(self.tmp.name);self.root=self.base/'host';tone=c.demo(self.base/'fixture');self.src=self.base/'fixture'/'audio'/(tone+'.wav')
  self.receipt={'version':v.RECEIPT,'eventId':'synthetic-001','planDigest':'fixture','started':{'recording':True,'stream':False},'sceneChanges':[],'ended':{'recording':'confirmed-stopped','stream':'not-started'},'recordingOutputPath':str(self.src),'disposition':'recording_only','faults':['synthetic failed StartStream']}
 def tearDown(self):self.tmp.cleanup()
 def preserve(self):return v.preserve(self.root,self.src,'Test','Synthetic',self.receipt,True)
 def test_stream_failure_preserves_exact_original(self):
  ident=self.preserve();folder,r,orig=v.load(self.root,ident);self.assertEqual(orig.read_bytes(),self.src.read_bytes());self.assertFalse(r['source']['reported_stream_start']);self.assertEqual(r['source']['fault_count'],1);self.assertEqual(r['publication'],'PRIVATE');self.assertEqual(json.loads((folder/'source-receipt.json').read_text()),self.receipt)
 def test_no_consent(self):
  with self.assertRaises(ValueError):v.preserve(self.root,self.src,'Test','Synthetic',confirmed=False)
 def test_stop_unknown(self):
  self.receipt['ended']['recording']='unknown'
  with self.assertRaises(ValueError):self.preserve()
 def test_wrong_path(self):
  self.receipt['recordingOutputPath']=str(self.base/'else.wav')
  with self.assertRaises(ValueError):self.preserve()
 def test_manual_no_air_claim(self):
  ident=v.preserve(self.root,self.src,'Test','Synthetic',confirmed=True);self.assertEqual(v.load(self.root,ident)[1]['source']['kind'],'manual')
 def test_corruption(self):
  ident=self.preserve();v.load(self.root,ident)[2].write_bytes(b'bad')
  with self.assertRaises(ValueError):v.load(self.root,ident)
 def test_failed_projection_leaves_original(self):
  ident=self.preserve()
  with self.assertRaises(OSError):v.project(self.root,ident,ffmpeg='no-such-ffmpeg-binary')
  self.assertIsNone(v.load(self.root,ident)[1]['projection']);self.assertTrue(self.src.is_file())
 @unittest.skipUnless(shutil.which('ffmpeg'),'FFmpeg unavailable')
 def test_actual_video_projection_private(self):
  video=self.base/'recorded.mkv';subprocess.run(['ffmpeg','-v','error','-f','lavfi','-i','color=c=black:s=64x64:r=5','-i',str(self.src),'-shortest','-c:v','ffv1','-c:a','pcm_s16le',str(video)],check=True)
  self.src=video;self.receipt['recordingOutputPath']=str(video);ident=self.preserve();media=v.project(self.root,ident);row=c.item(self.root,media);self.assertEqual(row[6:8],(0,0));self.assertEqual(row[3],'.mp3');self.assertNotIn(b'Synthetic',c.page(self.root));self.assertEqual(v.load(self.root,ident)[1]['projection']['media_id'],media);c.permission(self.root,media,'local',True);self.assertIn(b'Synthetic',c.page(self.root));self.assertTrue(video.is_file())
  with self.assertRaises(ValueError):v.project(self.root,ident)
if __name__=='__main__':unittest.main()

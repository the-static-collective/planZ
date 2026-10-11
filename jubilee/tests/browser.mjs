// Run after npm ci --prefix jubilee and npx --prefix jubilee playwright install chromium.
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,...(process.env.JUBILEE_CHROMIUM?{executablePath:process.env.JUBILEE_CHROMIUM}:{}),args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
const errors=[], network=[];
let server=null, localOrigin=null;
if(process.env.JUBILEE_HTTP==='1') {
  const html=readFileSync(new URL('../dist/index.html',import.meta.url));
  server=createServer((_req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  localOrigin=`http://127.0.0.1:${server.address().port}`;
}
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{if(/^https?:/.test(r.url()) && !(localOrigin && r.url().startsWith(localOrigin+'/')))network.push(r.url());});
const url=localOrigin?localOrigin+'/':new URL('../dist/index.html',import.meta.url).href;
let checks=0;
async function fresh(){await page.goto(url);}
async function next(n){for(let i=0;i<n;i++)await page.locator('#next-action').click();}
try {
  await fresh();assert.equal(await page.locator('#main-view [data-card]').count(),4);
  assert.ok(!(await page.locator('body').innerText()).includes('Private synthetic placeholder'));
  await page.locator('[data-card="genesis-door"]').click();
  assert.ok((await page.locator('#door-copy').innerText()).includes('there is no invented Scripture link'));
  await page.keyboard.press('Escape');assert.equal(await page.locator('dialog').evaluate(d=>d.open),false);checks++;
  if(process.env.JUBILEE_SCREENSHOTS){mkdirSync(process.env.JUBILEE_SCREENSHOTS,{recursive:true});await page.screenshot({path:process.env.JUBILEE_SCREENSHOTS+'/giving-tree.png',fullPage:true});}

  await fresh();
  await next(13);assert.equal(await page.locator('#next-action').isDisabled(),true);
  assert.ok((await page.locator('#step-title').innerText()).includes('branch is still here'));
  assert.equal(await page.locator('#history li').count(),13);
  await page.locator('[data-view="caravan"]').click();
  assert.ok((await page.locator('#main-view').innerText()).includes('CONFIRMED'));
  assert.ok((await page.locator('#main-view').innerText()).includes('Received in River'));checks++;
  if(process.env.JUBILEE_SCREENSHOTS)await page.screenshot({path:process.env.JUBILEE_SCREENSHOTS+'/caravan-return.png',fullPage:true});

  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);
  const publicSnapshot=JSON.parse(readFileSync(await download.path(),'utf8'));
  assert.equal(publicSnapshot.returns.length,1);assert.equal(publicSnapshot.cards.length,6);
  assert.deepEqual(publicSnapshot.appliedEffects,[]);
  assert.ok(!JSON.stringify(publicSnapshot).includes('held-need'));checks++;

  await fresh();await next(4);await page.locator('[data-card="shared-table"]').click();
  await page.getByRole('button',{name:'The neighbor declines',exact:true}).click();
  assert.equal(await page.locator('#next-action').isDisabled(),true);
  assert.ok((await page.locator('#blocked-note').innerText()).includes('Invalid scoped decision'));checks++;

  await fresh();await page.locator('[data-card="traveling-song"]').click();
  await page.getByRole('button',{name:'Withdraw this invitation in rehearsal'}).click();
  assert.equal(await page.locator('#main-view [data-card="traveling-song"]').count(),0);
  await next(2);assert.equal(await page.locator('#next-action').isDisabled(),true);
  await page.locator('[data-view="paper"]').click();
  assert.equal(await page.locator('#print-cards .door-card').count(),5);
  await page.emulateMedia({media:'print'});assert.equal(await page.locator('#print-cards').isVisible(),true);
  assert.equal(await page.locator('main').isVisible(),false);await page.emulateMedia({media:'screen'});checks++;

  await fresh();await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
  assert.equal(await page.locator('#next-action').isVisible(),true);await next(1);
  if(process.env.JUBILEE_SCREENSHOTS)await page.screenshot({path:process.env.JUBILEE_SCREENSHOTS+'/mobile-tree.png',fullPage:true});checks++;

  assert.deepEqual(errors,[]);assert.deepEqual(network,[]);checks++;
  console.log(`${checks} browser journey checks passed; zero page errors; zero external HTTP requests`);
} finally {await browser.close();if(server)server.close();}

import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[],network=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
const url=new URL('../dist/field-kit.html',import.meta.url).href;
const tab=async name=>page.locator(`[data-tab="${name}"]`).click();
const fill=async(form,data)=>{for(const [k,v]of Object.entries(data)){const locator=page.locator(`${form} [name="${k}"]`);if(await locator.evaluate(el=>el.tagName==='SELECT'))await locator.selectOption(v);else await locator.fill(v);}};
const submit=async form=>page.locator(form+' button[type="submit"],'+form+' button.primary').click();
async function host(town){await tab('host');await fill('#host-form',{town,label:'Example '+town,host:'host-'+town,decision:'ACCEPT'});for(const c of await page.locator('#host-form [type="checkbox"]').all())await c.check();await submit('#host-form');}
async function card(kind,id,town,owner,visibility='PUBLIC',permissions=[]){await tab('tree');await fill('#card-form',{card:id,town,owner,kind,label:id==='private-tag'?'Held example label':kind==='NEED'?'Example shared table':'Example '+kind.toLowerCase(),visibility});for(const value of permissions)await page.locator(`#card-form [value="${value}"]`).check();}
async function operation(type,data){await tab('record');await page.locator('#operation').selectOption(type);await fill('#operation-form',data);await submit('#operation-form');}
let checks=0,backupPath;
try{
  await page.goto(url);assert.equal(await page.locator('#field-history li.empty').count(),1);assert.equal(await page.locator('#readiness li.done').count(),0);
  await page.locator('#inspect-genesis').click();await page.locator('#source-dialog').waitFor({state:'visible'});
  const frame=page.frameLocator('#source-dialog iframe');await frame.locator('#revival-data').waitFor({state:'attached'});
  const address=await frame.locator('body').evaluate(()=>decodeURIComponent(location.hash.slice(1)));
  assert.ok(address.endsWith('/passage/Gen.1.1'));assert.ok((await frame.locator('body').innerText()).includes('Gen.1.1'));
  await page.locator('#source-dialog button.close').click();checks++;

  await fill('#host-form',{town:'orchard',label:'Example orchard',host:'host-orchard',decision:'ACCEPT'});await submit('#host-form');
  assert.ok((await page.locator('#field-notice').innerText()).includes('six host checks'));
  for(const town of ['orchard','river','harbor'])await host(town);assert.equal(await page.locator('.field-list .field-item').count(),3);checks++;
  if(process.env.JUBILEE_SCREENSHOTS){mkdirSync(process.env.JUBILEE_SCREENSHOTS,{recursive:true});await page.screenshot({path:process.env.JUBILEE_SCREENSHOTS+'/field-hosts.png',fullPage:true});}

  await card('NEED','private-tag','orchard','private-owner','PRIVATE');await submit('#card-form');
  assert.ok(!(await page.locator('body').innerText()).includes('Held example label'));
  await page.locator('#show-held').check();assert.ok((await page.locator('#card-list').innerText()).includes('Held example label'));await page.locator('#show-held').uncheck();
  await card('NEED','table','orchard','recipient-example','PUBLIC',['PRINT','INTRODUCE']);await submit('#card-form');
  await card('OFFER','kitchen','river','helper-example','PUBLIC',['INTRODUCE']);await submit('#card-form');checks++;

  await operation('INTRODUCE',{need:'table',offer:'kitchen'});
  await tab('record');await page.locator('#operation').selectOption('DECIDE');
  const intro=await page.locator('#operation-form [name="introduction"] option').nth(1).getAttribute('value');
  await operation('DECIDE',{introduction:intro,actor:'recipient-example',decision:'ACCEPT'});
  await operation('HELP_REPORT',{introduction:intro,actor:'helper-example'});assert.ok((await page.locator('#field-notice').innerText()).includes('approved helper'));
  await operation('DECIDE',{introduction:intro,actor:'helper-example',decision:'ACCEPT'});
  await operation('HELP_REPORT',{introduction:intro,actor:'helper-example'});
  await operation('HELP_CONFIRM',{introduction:intro,actor:'helper-example'});assert.ok((await page.locator('#field-notice').innerText()).includes('recipient'));
  await operation('HELP_CONFIRM',{introduction:intro,actor:'recipient-example'});
  assert.ok((await page.locator('.field-help').innerText()).includes('RECIPIENT_CONFIRMED_DECLARATION'));checks++;

  for(const town of ['orchard','river','harbor'])await operation('VISIT',{town,actor:'host-'+town});
  await operation('OBSERVE',{card:'table',town:'orchard',actor:'observer-example',medium:'PAPER'});
  const media={name:'synthetic-test.bin',mimeType:'application/octet-stream',buffer:Buffer.from('Synthetic byte specimen; not a real recording')};
  await card('MUSIC','song','orchard','musician-example');await page.locator('#media-file').setInputFiles(media);await page.locator('#card-form [name="handoff"]').selectOption('river');
  await page.waitForFunction(()=>document.querySelector('#media-digest').textContent.includes('SHA-256'));await submit('#card-form');
  await operation('HANDOFF',{card:'song',toTown:'river',actor:'musician-example'});
  await tab('record');await page.locator('#operation').selectOption('RECEIVE');
  const carry=await page.locator('#operation-form [name="carry"] option').nth(1).getAttribute('value');
  await fill('#operation-form',{carry,actor:'host-river'});await page.locator('#received-file').setInputFiles(media);await submit('#operation-form');
  await page.waitForFunction(()=>document.querySelectorAll('#readiness li.done').length===4);
  await tab('return');assert.ok((await page.locator('#field-view').innerText()).includes('READY FOR HUMAN REVIEW'));
  await fill('#return-form',{actor:'steward-example'});await submit('#return-form');checks++;

  const [snapshotDownload]=await Promise.all([page.waitForEvent('download'),page.locator('#public-summary').click()]);
  const summary=JSON.parse(readFileSync(await snapshotDownload.path(),'utf8'));
  assert.equal(summary.counts.recipientDeclarations,1);assert.equal(summary.counts.receiverDeclarations,1);
  assert.ok(!JSON.stringify(summary).includes('private-tag'));assert.ok(!JSON.stringify(summary).includes('recipient-example'));assert.equal(summary.readiness.ownerAdmission,'NOT_CLAIMED');
  assert.equal(await page.locator('#field-print .door-card').count(),1);checks++;
  const [hostDownload]=await Promise.all([page.waitForEvent('download'),page.locator('#save-host-pack').click()]);
  const hostPack=readFileSync(await hostDownload.path(),'utf8');
  assert.equal(hostPack,readFileSync(new URL('../dist/host-pack.html',import.meta.url),'utf8'));
  assert.ok(!hostPack.includes('recipient-example'));assert.ok(!hostPack.includes('Held example label'));checks++;

  await tab('save');await fill('#save-form',{passphrase:'local test passphrase only'});
  const [backupDownload]=await Promise.all([page.waitForEvent('download'),submit('#save-form')]);backupPath=await backupDownload.path();
  const raw=readFileSync(backupPath,'utf8');assert.ok(!raw.includes('Held example label'));assert.ok(!raw.includes('recipient-example'));
  const eventCount=await page.locator('#field-history li').count();await page.reload();await tab('save');await page.locator('#load-form [name="backup"]').setInputFiles(backupPath);
  await fill('#load-form',{passphrase:'wrong long passphrase'});await submit('#load-form');await page.waitForFunction(()=>document.querySelector('#field-notice').textContent.includes('could not be opened'));
  assert.equal(await page.locator('#field-history li.empty').count(),1);
  await fill('#load-form',{passphrase:'local test passphrase only'});await submit('#load-form');await page.waitForFunction(()=>document.querySelector('#field-notice').textContent.includes('replayed locally'));
  assert.equal(await page.locator('#field-history li').count(),eventCount);checks++;

  await tab('tree');await page.locator('[data-withdraw="table"]').click();
  assert.equal(await page.locator('[data-withdraw="table"]').count(),0);await tab('return');
  assert.ok((await page.locator('#field-view').innerText()).includes('HELD MISSING EVIDENCE'));assert.equal(await page.locator('#field-print .door-card').count(),0);checks++;

  await page.setViewportSize({width:390,height:844});for(const name of ['host','tree','record','return','save']){await tab(name);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
  if(process.env.JUBILEE_SCREENSHOTS)await page.screenshot({path:process.env.JUBILEE_SCREENSHOTS+'/field-mobile.png',fullPage:true});checks++;
  await card('OFFER','literal-label','river','steward-example');await page.locator('#card-form [name="label"]').fill('<img src="https://example.invalid/test" onerror="alert(1)">');await submit('#card-form');
  assert.equal(await page.locator('#card-list img').count(),0);assert.ok((await page.locator('#card-list').innerText()).includes('<img src='));checks++;
  assert.deepEqual(errors,[]);assert.deepEqual(network,[]);checks++;
  console.log(`${checks} field browser checks passed; full declaration journey, encrypted restore, source world, withdrawal, zero external requests`);
}finally{await browser.close();}

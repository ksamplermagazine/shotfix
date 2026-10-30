import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {existsSync} from 'node:fs';
import * as model from '../public/model.js';

test('workshop demo: only wide video + identity input, two camera previews, selected-image video; no provider calls',{skip:!existsSync(new URL('../public/assets/private/painter-workshop/mock-media.json',import.meta.url))},async()=>{
 const source=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
 // Exercise the real application flow functions. Rendering and browser storage
 // are replaced here; this is not a browser or a 3D rendering test.
 const program=source.slice(0,source.indexOf("$('sourcePicker').onchange")).replace(/^import .*;\r?\n/gm,'');
 const requests=[],elements=new Map(),renders=[],notices=[];
 const getElementById=id=>{if(!elements.has(id))elements.set(id,{disabled:false,textContent:'',style:{}});return elements.get(id);};
 const ctx=vm.createContext({console,crypto:globalThis.crypto,Blob,Response,Uint8Array,URL,structuredClone,setTimeout,clearTimeout,...model,
   document:{getElementById,querySelectorAll:()=>[]},
   fetch:async url=>{requests.push(String(url));assert.equal(String(url).startsWith('./assets/private/painter-workshop/'),true,'demo must only read local fixture assets');const data=await readFile(new URL('../public/'+String(url).slice(2),import.meta.url));return new Response(data,{headers:{'Content-Type':String(url).endsWith('.mp4')?'video/mp4':String(url).endsWith('.png')?'image/png':'application/json'}});},
   renderEvents:renders,notices});
 vm.runInContext(program,ctx);
 vm.runInContext("render=()=>renderEvents.push({route,mode});save=async()=>{};openModal=x=>notices.push(x);",ctx);
 await vm.runInContext('loadPainterWorkshop()',ctx);
 assert.equal(vm.runInContext('route',ctx),'input');
 assert.equal(vm.runInContext('p.sourceType',ctx),'video');
 assert.equal(vm.runInContext('p.sourceName',ctx),'video_cut1_00001_ (5).mp4');
 assert.equal(vm.runInContext('p.references.length',ctx),1);
 assert.equal(vm.runInContext('p.references[0].name',ctx),'Character sheet');
 assert.equal(vm.runInContext('currentTakes().length',ctx),1);
 assert.equal(vm.runInContext('p.references.length',ctx),1,'recorded outputs must not be input references');
 await vm.runInContext('buildGuide()',ctx);
 assert.equal(vm.runInContext('route',ctx),'editor');
 assert.equal(vm.runInContext('p.demoGuideBuilt',ctx),true);
 await vm.runInContext('generationDialog()',ctx);
 assert.equal(vm.runInContext('currentTakes().length',ctx),1,'wide/arbitrary view must not silently use a different angle sample');
 assert.ok(elements.get('toast').textContent.includes('Import your generated image'));
 await vm.runInContext("p.camera=clone(p.sceneShots.find(x=>x.id==='side').camera);generationDialog()",ctx);
 assert.equal(vm.runInContext('selected().origin',ctx),'workflow-result');
 assert.equal(vm.runInContext('selected().mockShotId',ctx),'side');
 const sideImage=vm.runInContext('selected().id',ctx);
 await vm.runInContext('toggleVideoMode()',ctx);
 assert.equal(vm.runInContext('p.videoImageId',ctx),sideImage);
 await vm.runInContext('generationDialog()',ctx);
 assert.equal(vm.runInContext('selected().kind',ctx),'video');
 assert.equal(vm.runInContext('selected().parentTakeId',ctx),sideImage);
 assert.equal(vm.runInContext('selected().mockShotId',ctx),'side');
 assert.equal(vm.runInContext('selected().duration',ctx),4.041667);
 assert.equal(vm.runInContext('selected().blob.type',ctx),'video/mp4');
 await vm.runInContext('toggleVideoMode()',ctx);
 await vm.runInContext("p.camera=clone(p.sceneShots.find(x=>x.id==='close').camera);generationDialog()",ctx);
 const closeImage=vm.runInContext('selected().id',ctx);
 assert.notEqual(closeImage,sideImage);
 await vm.runInContext('toggleVideoMode()',ctx);
 assert.equal(vm.runInContext('currentTakes().length',ctx),0,'side video must not appear as the result of the selected close-up image');
 await vm.runInContext('generationDialog()',ctx);
 assert.equal(vm.runInContext('selected().mockShotId',ctx),'close');
 assert.equal(vm.runInContext('selected().parentTakeId',ctx),closeImage);
 assert.equal(vm.runInContext('currentTakes().length',ctx),1);
 assert.ok(requests.includes('./assets/private/painter-workshop/verified-motion.mp4'));
 assert.ok(requests.includes('./assets/private/painter-workshop/close.mp4'));
});

test('changing the camera or lens cannot claim a fixed demo result matches it',()=>{
 const shots=[{id:'wide',camera:{az:0,el:10,focal:18,distance:4.6}},{id:'side',camera:{az:-109,el:-22,focal:24,distance:1.32}},{id:'close',camera:{az:-90,el:5,focal:35,distance:.93}}];
 assert.equal(model.demoShotForCamera(shots[0].camera,shots),null);
 assert.equal(model.demoShotForCamera(shots[1].camera,shots)?.id,'side');
 assert.equal(model.demoShotForCamera({...shots[1].camera,focal:50},shots),null);
 assert.equal(model.demoShotForCamera({...shots[2].camera,az:-80},shots),null);
});

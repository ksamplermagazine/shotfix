import test from 'node:test';import assert from 'node:assert/strict';
import {cameraAt} from '../public/motion.js';
const start={az:-109,el:-22,focal:24,distance:1.32,target:[0,.98,-.3]},end={az:-94,el:5,focal:35,distance:.925,target:[0,1.16,-.48]},motion={start,end,seconds:4};
test('camera guide starts and ends at the chosen shot, with a smooth bounded transition',()=>{assert.deepEqual(cameraAt(motion,0),start);const last=cameraAt(motion,4);for(const key of ['az','el','focal','distance'])assert.ok(Math.abs(last[key]-end[key])<1e-10);for(let i=0;i<3;i++)assert.ok(Math.abs(last.target[i]-end.target[i])<1e-10);for(let t=0;t<=4;t+=.1){const c=cameraAt(motion,t);assert.ok(c.focal>=24&&c.focal<=35);assert.ok(c.distance>=.925&&c.distance<=1.32);}assert.deepEqual(cameraAt(motion,-1),start);});
test('camera crosses the orbit seam along the shorter arc',()=>{const halfway=cameraAt({start:{...start,az:179},end:{...end,az:-179},seconds:4},2);assert.equal(halfway.az,180);});

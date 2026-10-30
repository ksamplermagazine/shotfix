export const clone=x=>structuredClone(x);
export function cameraKey(c){return JSON.stringify([...['az','el','focal','distance'].map(k=>Math.round(Number(c[k])*100)/100),...(c.target||[0,1,0]).map(v=>Math.round(v*100)/100)]);}
export function validateCamera(c){for(const [k,min,max]of [['az',-180,180],['el',-45,75],['focal',18,100],['distance',.25,20]])if(!Number.isFinite(c[k])||c[k]<min||c[k]>max)throw Error('Invalid camera '+k);return clone(c);}
export function validatePlan(p){if(!p||p.version!==1||!Array.isArray(p.subjects)||p.subjects.length>8)throw Error('A scene plan needs version 1 and up to eight subjects.');
 const n=(v,min,max)=>{if(!Number.isFinite(v)||v<min||v>max)throw Error('Scene values are outside the supported range.');return v;};
 return {version:1,...(p.asset==='painter-workshop'?{asset:p.asset}:{}),method:String(p.method||'manual').slice(0,80),room:p.room==='arch'?'arch':'studio',horizon:n(p.horizon??.45,.15,.8),subjects:p.subjects.map(s=>({kind:s.kind==='product'?'product':'person',x:n(s.x,0,1),bottom:n(s.bottom,.15,1),height:n(s.height,.05,.9),width:n(s.width??.15,.02,.8)}))};}
export function estimatePlan(canvas,kind='person'){
 const ctx=canvas.getContext('2d',{willReadFrequently:true}),w=canvas.width,h=canvas.height,d=ctx.getImageData(0,0,w,h).data;
 // A local pixel-layout heuristic, not depth inference or semantic recognition.
 const luma=(x,y)=>{const i=(y*w+x)*4;return .2126*d[i]+.7152*d[i+1]+.0722*d[i+2];};let horizon=.45,best=0;
 for(let y=Math.floor(h*.25);y<h*.65;y++){let edge=0;for(let x=1;x<w;x+=3)edge+=Math.abs(luma(x,y)-luma(x,y-1));if(edge>best){best=edge;horizon=y/h;}}
 let minX=w,minY=h,maxX=0,maxY=0,count=0;const borders=[];for(let y=0;y<h;y+=8){borders.push(luma(1,y),luma(w-2,y));}const bg=borders.reduce((a,b)=>a+b,0)/borders.length;
 for(let y=Math.floor(h*.1);y<h*.94;y+=2)for(let x=Math.floor(w*.2);x<w*.8;x+=2)if(Math.abs(luma(x,y)-bg)>52){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);count++;}
 const valid=count>60&&(maxX-minX)<w*.53&&(maxY-minY)>h*.2;
 return validatePlan({version:1,method:'local-layout-draft',room:'studio',horizon:Math.min(.65,Math.max(.25,horizon)),subjects:[{kind,x:valid?(minX+maxX)/(2*w):.5,bottom:valid?Math.min(.94,maxY/h):.86,height:valid?Math.min(.82,(maxY-minY)/h):.65,width:valid?Math.max(.06,(maxX-minX)/w):.15}]});
}
export function validateRange(start,end,duration){if(![start,end,duration].every(Number.isFinite)||start<0||end<=start||end>duration+.001)throw Error('Select a valid source range.');return {start,end,seconds:end-start};}
export function takeSnapshot(project,media,kind='image',origin='imported') {return {id:crypto.randomUUID(),kind,origin,blob:media,camera:clone(project.camera),plan:clone(project.plan),createdAt:new Date().toISOString(),sourceId:project.sourceId};}
export function restoreTake(project,take){if(take.sourceId!==project.sourceId)throw Error('This take belongs to a different source.');project.camera=clone(take.camera);project.plan=clone(take.plan);project.selectedTake=take.id;return project;}
export const layoutPrompt=`Return ONLY a JSON scene plan, no markdown or code. Schema: {"version":1,"method":"vision-draft","room":"studio" or "arch","horizon":0.15..0.8,"subjects":[{"kind":"person" or "product","x":0..1,"bottom":0.15..1,"height":0.05..0.9,"width":0.02..0.8}]}. Coordinates are normalized image positions. Mark each visible subject's center x, bottom y, and bounding-box width/height. Use simple approximate geometry, not exact reconstruction. Maximum eight subjects. Preserve the reference's major placement.`;

export function demoShotForCamera(camera,shots=[]){return shots.find(shot=>["side","close"].includes(shot.id)&&cameraKey(shot.camera)===cameraKey(camera))||null;}

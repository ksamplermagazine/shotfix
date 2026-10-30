export function cameraAt(motion,time){
 const x=Math.max(0,Math.min(1,time/Math.max(.01,motion.seconds))),t=x*x*(3-2*x),a=motion.start,b=motion.end;
 const azDelta=((b.az-a.az+540)%360)-180;
 const c={az:a.az+azDelta*t};for(const key of ['el','focal','distance'])c[key]=a[key]+(b[key]-a[key])*t;
 c.target=(a.target||[0,1,0]).map((v,i)=>v+((b.target||[0,1,0])[i]-v)*t);return c;
}

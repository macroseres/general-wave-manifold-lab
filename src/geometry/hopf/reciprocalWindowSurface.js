import {reciprocalHopfAt} from '../../math/sonic/hopfReciprocal.js'
import {fromReciprocal} from '../../math/charts/reciprocalTransition.js'
import {clipSpectralTriangle} from './spectralCurveClip.js'

/** Sample the reciprocal implicit Hopf sheet in bounded DISPLAY Y, not bounded X.
 * X=Y/Z necessarily becomes unbounded as Z approaches zero for fixed Y != 0.
 * Z=0 itself has no finite (tau,Y,zc) image and is intentionally excluded.
 */
export function reciprocalWindowHopfMesh(p,{
 side='minus',tauMin=-1,tauMax=1,YMin=-6,YMax=6,
 ZMinAbs=0.001,ZMaxAbs=0.35,nZ=100,nY=128,clipDet=true,
}={}){
 const positions=[],indices=[]
 const stats={sampled:0,positive:0,emitted:0,invalid:0,zeroTraceCoefficient:0,windowClipped:0}
 if(!(ZMinAbs>0&&ZMaxAbs>ZMinAbs&&nZ>=2&&nY>=2&&tauMin<tauMax&&YMin<YMax))return {kind:'invalid-input',positions,indices,stats}
 // At fixed Z, trace is affine in (free, Y). Its coefficients are
 // evaluated once per section, not twice for every sampled vertex.
 const sectionCache=new Map()
 const section=Z=>{
   if(sectionCache.has(Z))return sectionCache.get(Z)
   const h0=reciprocalHopfAt(0,0,Z,p,side)
   const hf=reciprocalHopfAt(1,0,Z,p,side)
   const hy=reciprocalHopfAt(0,1/Z,Z,p,side)
   let result=null
   if(h0.kind==='regular'&&hf.kind==='regular'&&hy.kind==='regular'&&h0.coordinate===hf.coordinate&&h0.coordinate===hy.coordinate){
     const a=hf.trace-h0.trace,b=hy.trace-h0.trace,c=h0.trace
     if(Number.isFinite(a)&&Number.isFinite(b)&&Number.isFinite(c)&&Math.abs(a)>=1e-12*Math.max(1,Math.abs(c)))result={a,b,c}
   }
   sectionCache.set(Z,result)
   return result
 }
 const at=(Y,Z)=>{
   stats.sampled++
   const coeff=section(Z)
   if(!coeff){stats.invalid++;return null}
   const X=Y/Z
   const free=-(coeff.c+coeff.b*Y)/coeff.a
   const h=reciprocalHopfAt(free,X,Z,p,side)
   const q=fromReciprocal(free,X,Z,p)
   if(h.kind!=='regular'||q.kind!=='regular'||!Number.isFinite(h.det)||q.projectionResidual>1e-6){stats.invalid++;return null}
   if(h.det>=0)stats.positive++
   return {p:[q.tau,Y,q.zc],det:h.det,Z}
 }
 const interp=(a,b,t)=>{
   // Inverse compactification: zc=(2/pi)atan(z), Z=1/z.
   return at(a.p[1]+t*(b.p[1]-a.p[1]),a.Z+t*(b.Z-a.Z))
 }
 const clip=(poly,fn)=>{
   const out=[]
   for(let i=0;i<poly.length;i++){
     const a=poly[i],b=poly[(i+1)%poly.length],fa=fn(a),fb=fn(b)
     if(fa>=0)out.push(a)
     if((fa>=0)!==(fb>=0)){
       let l=0,r=1,mid=null
       for(let k=0;k<22;k++){
         const t=(l+r)/2;mid=interp(a,b,t);if(!mid)break
         if((fn(mid)>=0)===(fa>=0))l=t;else r=t
       }
       if(mid)out.push(mid)
     }
   }
   return out
 }
 const emitPolygon=tri=>{
   if(tri.some(x=>!x))return
   let poly=tri
   for(const fn of [v=>v.p[0]-tauMin,v=>tauMax-v.p[0],]){
     poly=clip(poly,fn);if(poly.length<3){stats.windowClipped++;return}
   }
   for(let i=1;i+1<poly.length;i++){
     const pts=[poly[0].p,poly[i].p,poly[i+1].p]
     if(pts.some(v=>!v.every(Number.isFinite)))continue
     const [a,b,c]=pts,ab=b.map((v,k)=>v-a[k]),ac=c.map((v,k)=>v-a[k])
     const norm=Math.hypot(ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0])
     if(norm<1e-12)continue
     const start=positions.length/3;positions.push(...a,...b,...c);indices.push(start,start+1,start+2);stats.emitted++
   }
 }
 const emit=tri=>{
   if(!clipDet){emitPolygon(tri);return}
   if(tri.some(v=>!v))return
   const fragments=clipSpectralTriangle(tri,interp,{depth:2})
   for(const fragment of fragments)emitPolygon(fragment)
 }
 for(const sign of [-1,1]){
   let previous=null
   for(let j=0;j<=nZ;j++){
     const t=j/nZ
     const Z=sign*(ZMaxAbs*Math.pow(ZMinAbs/ZMaxAbs,t))
     const row=Array.from({length:nY+1},(_,i)=>at(YMin+(YMax-YMin)*i/nY,Z))
     if(previous)for(let i=0;i<nY;i++){
       emit([previous[i],previous[i+1],row[i+1]])
       emit([previous[i],row[i+1],row[i]])
     }
     previous=row
   }
 }
 return {kind:'regular',positions,indices,stats,chart:'reciprocal-Y-window'}
}

import { jacobian } from '../flux/quadraticFlux.js'

/** Reciprocal projective chart r=(1,Z), with X=u+−u−.
 * This chart is regular at Z=0, the direction missing from r=(z,1).
 * The free coordinate is one component of Ubar; it is NOT the old tau.
 */
export function reciprocalHopfAt(free, X, Z, p, side) {
  if (!['minus','plus'].includes(side) || ![free,X,Z].every(Number.isFinite)) return {kind:'invalid-input'}
  const G=(u,v)=>{const A=jacobian([u,v],p);return A[1][0]+Z*(A[1][1]-A[0][0])-Z*Z*A[0][1]}
  const c=G(0,0),a=G(1,0)-c,b=G(0,1)-c
  let u,v,coordinate
  if(Math.abs(a)>=Math.abs(b)&&Math.abs(a)>1e-12){v=free;u=-(c+b*v)/a;coordinate='v'}
  else if(Math.abs(b)>1e-12){u=free;v=-(c+a*u)/b;coordinate='u'}
  else return {kind:'degenerate-eigendirection'}
  const A=jacobian([u,v],p),s=A[0][0]+Z*A[0][1]
  const sign=side==='plus'?1:-1
  const J=jacobian([u+sign*X/2,v+sign*Z*X/2],p)
  const m00=J[0][0]-s,m11=J[1][1]-s
  const trace=m00+m11,det=m00*m11-J[0][1]*J[1][0]
  return {kind:'regular',Ubar:[u,v],s,trace,det,discriminant:trace*trace-4*det,coordinate,Z,X,free}
}

/** Exact Z=0 cross-section. The trace-zero locus is an affine line in (free,X).
 * We sample its bounded segment; no claims about unbounded directions are made.
 */
export function reciprocalHopfSection(p,{side='minus',Z=0,freeMin=-6,freeMax=6,XMin=-6,XMax=6,samples=128}={}){
  if(![freeMin,freeMax,XMin,XMax,Z].every(Number.isFinite)||freeMin>=freeMax||XMin>=XMax||!Number.isInteger(samples)||samples<2)return {kind:'invalid-input'}
  const h0=reciprocalHopfAt(0,0,Z,p,side),h1=reciprocalHopfAt(1,0,Z,p,side),h2=reciprocalHopfAt(0,1,Z,p,side)
  if([h0,h1,h2].some(h=>h.kind!=='regular'))return {kind:'invalid-chart'}
  const a=h1.trace-h0.trace,b=h2.trace-h0.trace,c=h0.trace
  const points=[]
  const add=(f,x)=>{if(f<freeMin-1e-9||f>freeMax+1e-9||x<XMin-1e-9||x>XMax+1e-9)return;if(!points.some(p=>Math.hypot(p[0]-f,p[1]-x)<1e-8))points.push([f,x])}
  if(Math.abs(b)>1e-12){add(freeMin,(-c-a*freeMin)/b);add(freeMax,(-c-a*freeMax)/b)}
  if(Math.abs(a)>1e-12){add((-c-b*XMin)/a,XMin);add((-c-b*XMax)/a,XMax)}
  if(points.length<2)return {kind:Math.hypot(a,b)<1e-12?'degenerate-trace':'outside-window',a,b,c}
  const start=points[0],end=points[1]
  let maxDet=-Infinity,minDet=Infinity,positiveSamples=0,positiveExample=null
  for(let i=0;i<=samples;i++){
    const t=i/samples,f=start[0]+t*(end[0]-start[0]),x=start[1]+t*(end[1]-start[1]);const h=reciprocalHopfAt(f,x,Z,p,side)
    if(h.kind!=='regular'||!Number.isFinite(h.det))return {kind:'numerical-failure'}
    minDet=Math.min(minDet,h.det);maxDet=Math.max(maxDet,h.det)
    if(h.det>1e-10){positiveSamples++;positiveExample??={free:f,X:x,det:h.det,trace:h.trace}}
  }
  return {kind:'sampled',side,Z,coordinate:h0.coordinate,segment:[start,end],minDet,maxDet,positiveSamples,totalSamples:samples+1,positiveExample}
}

/**
 * Geometry adapter for inverse images of a fixed state under pi_- and pi_+.
 * Mathematical fibre evaluation remains in src/math/state/fibers.js.
 */
import { zFromZc, zcFromZ } from '../../math/charts/zChart.js'
import { characteristicSpectrum } from '../../math/characteristic/spectrum.js'
import { characteristicLifts, stateFiberPoint, stateFiberPointReciprocal } from '../../math/state/fibers.js'

const finite = Number.isFinite

/** Robust visualization window for a fixed-state fibre.
 * It is a computational/view window only; it does not change the fibre.
 * Quantiles suppress poles of the projective parameterization while retaining
 * the visible regular branches and both reflected jump coordinates.
 */
export function stateFibreSuggestedWindow(U,p,{n=1601,zcLimit=.995}={}){
  if(!U||!finite(U[0])||!finite(U[1]))return null
  const tau=[],absY=[]
  for(let i=0;i<n;i++){
    const zc=-zcLimit+2*zcLimit*i/(n-1),z=zFromZc(zc)
    const q=stateFiberPoint(U,z,p,'minus')
    if(q.kind==='regular'&&finite(q.tau)&&finite(q.Y)){tau.push(q.tau);absY.push(Math.abs(q.Y))}
  }
  if(tau.length<8)return null
  tau.sort((a,b)=>a-b);absY.sort((a,b)=>a-b)
  const pick=(a,q)=>a[Math.min(a.length-1,Math.max(0,Math.floor(q*(a.length-1))))]
  let t0=pick(tau,.02),t1=pick(tau,.98),ym=pick(absY,.98)
  const lifts=characteristicLifts(U,p).filter(q=>q.kind==='finite').map(q=>stateFiberPoint(U,q.z,p,'minus')).filter(q=>q.kind==='regular'&&finite(q.tau))
  for(const q of lifts){t0=Math.min(t0,q.tau);t1=Math.max(t1,q.tau)}
  const ts=Math.max(.5,t1-t0),ypad=Math.max(.5,ym*.12),tpad=Math.max(.25,ts*.12)
  ym=Math.max(1,ym+ypad)
  return {tauMin:t0-tpad,tauMax:t1+tpad,YMin:-ym,YMax:ym}
}


/** Convert a regular reciprocal-chart fibre point back to canonical display
 * coordinates.  This is a chart transition, not a second definition of the
 * fibre.  Z=0 is intentionally not assigned a finite zc: the visual
 * compactification has two boundary representatives while the reciprocal
 * chart is regular across Z=0. */
export function reciprocalFibrePointToDisplay(q) {
  if(q?.kind!=='regular'||!finite(q.Z)||q.Z===0) return null
  const z=1/q.Z
  return {tau:q.eta*q.Z*q.Z,Y:q.Upsilon*q.Z,z,zc:zcFromZ(z),Z:q.Z,eta:q.eta,Upsilon:q.Upsilon,side:q.side,chart:'Z'}
}

/** Sample the global fibre in the reciprocal chart near projective infinity.
 * The returned negative/positive pieces are deliberately separate in the
 * (tau,Y,zc) renderer.  Mathematically they are continued through Z=0 in
 * (eta,Upsilon,Z); drawing a chord from zc=-1 to +1 would be false geometry. */
export function stateFibreReciprocalGeometry(U,p,side,{n=401,ZLimit=.35,ZGap=1e-4,maxCoordinate=1e6}={}){
  if(!U||!finite(U[0])||!finite(U[1]))return {negative:[],positive:[],atInfinity:null}
  const sample=(a,b)=>{
    const out=[]
    for(let i=0;i<n;i++){
      const Z=a+(b-a)*i/(n-1),q=stateFiberPointReciprocal(U,Z,p,side),d=reciprocalFibrePointToDisplay(q)
      if(d&&[d.tau,d.Y,d.zc].every(finite)&&Math.abs(d.tau)<=maxCoordinate&&Math.abs(d.Y)<=maxCoordinate)out.push(d)
    }
    return out
  }
  const atInfinity=stateFiberPointReciprocal(U,0,p,side)
  return {negative:sample(-ZLimit,-ZGap),positive:sample(ZGap,ZLimit),atInfinity}
}

export function stateFibreGeometry(U, p, {
  n=1201,zcLimit=.995,maxCoordinate=1e6,
}={}) {
  if(!U || !finite(U[0]) || !finite(U[1])) return {minus:[],plus:[],lifts:[]}
  const sampleSide=side=>{
    const segments=[]; let current=[]
    const flush=()=>{if(current.length>1)segments.push(current);current=[]}
    for(let i=0;i<n;i++){
      const zc=-zcLimit+2*zcLimit*i/(n-1),z=zFromZc(zc)
      const q=stateFiberPoint(U,z,p,side)
      if(q.kind!=='regular'||![q.tau,q.Y].every(finite)||Math.abs(q.tau)>maxCoordinate||Math.abs(q.Y)>maxCoordinate){flush();continue}
      const next={tau:q.tau,Y:q.Y,zc,z,side}
      // A projective pole must split the polyline; never join opposite sides by a fake chord.
      if(current.length){const prev=current[current.length-1],jump=Math.hypot(next.tau-prev.tau,next.Y-prev.Y);if(jump>Math.max(25,4*Math.hypot(prev.tau,prev.Y)+4)){flush()}}
      current.push(next)
    }
    flush(); return segments
  }
  const lifts=stateFibreCharacteristicIntersections(U,p)
  const reciprocal={minus:stateFibreReciprocalGeometry(U,p,'minus'),plus:stateFibreReciprocalGeometry(U,p,'plus')}
  return {minus:sampleSide('minus'),plus:sampleSide('plus'),reciprocal,lifts}
}

/** Exact characteristic intersections shared by the forward/backward fibres.
 * No display-window approximation is used here. */
export function stateFibreCharacteristicIntersections(U,p){
  if(!U||!finite(U[0])||!finite(U[1]))return []
  return characteristicLifts(U,p).map((lift,index)=>{
    if(lift.kind==='infinity')return {...lift,index,chart:'Z',shared:true}
    const minus=stateFiberPoint(U,lift.z,p,'minus'),plus=stateFiberPoint(U,lift.z,p,'plus')
    if(minus.kind!=='regular'||plus.kind!=='regular')return {...lift,index,chart:'z',shared:false}
    const spectrum=characteristicSpectrum(minus.tau,lift.z,p)
    return {...lift,index,chart:'z',tau:minus.tau,zc:zcFromZ(lift.z),branch:spectrum.branch,
      minusY:minus.Y,plusY:plus.Y,shared:Math.abs(minus.Y)<1e-8&&Math.abs(plus.Y)<1e-8&&Math.abs(minus.tau-plus.tau)<1e-10}
  })
}

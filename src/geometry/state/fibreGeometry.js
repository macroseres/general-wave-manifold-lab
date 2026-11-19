/**
 * Geometry adapter for inverse images of a fixed state under pi_- and pi_+.
 * Mathematical fibre evaluation remains in src/math/state/fibers.js.
 */
import { zFromZc, zcFromZ } from '../../math/charts/zChart.js'
import { characteristicSpectrum } from '../../math/characteristic/spectrum.js'
import { waveState } from '../../math/manifold/waveState.js'
import { characteristicLifts, stateFiberPoint, stateFiberPointReciprocal } from '../../math/state/fibers.js'
import { jacobian } from '../../math/flux/quadraticFlux.js'
import { regularFibreInterval } from '../../math/solution/forwardLiuOnFiniteFibre.js'
import { boundedPolynomialRoots } from './forwardSonicIntersections.js'

const finite = Number.isFinite

/** Sample the descending prefix in each direction from a finite lift. */
export function decreasingForwardShockArcs(U, seed, p) {
  return monotoneShockArcs(U,seed,p,"minus",-1)
}

/** Extend the displayed SS shock along its descending forward fibre. */
export function extendSlowShock(U,seed,chainEndpoint,p){
  if(!chainEndpoint||!seed)return null
  const direction=Math.sign(chainEndpoint[2]-seed.zc)
  const points=decreasingForwardShockArcs(U,seed,p).find(arc=>Math.sign(arc[1].zc-seed.zc)===direction)
  if(!points)return null

  // s(z)=numerator(z)/denominator(z); the sign of s' is the sign of N'D−ND'.
  const [[A,B],[C,D]]=jacobian(U,p)
  const numerator=[B*p.b02-D*p.a02,A*p.b02+B*p.b11-C*p.a02-D*p.a11,
    A*p.b11+B*p.b20-C*p.a11-D*p.a20,A*p.b20-C*p.a20]
  const denominator=[-p.a02,p.b02-p.a11,p.b11-p.a20,p.b20]
  const slope=[0,0,0,0,0]
  numerator.forEach((n,i)=>denominator.forEach((d,j)=>{
    if(i!==j)slope[i+j-1]+=(i-j)*n*d
  }))
  const slopeAt=z=>slope.reduceRight((sum,a)=>sum*z+a,0)
  const roots=[...boundedPolynomialRoots(slope),
    ...boundedPolynomialRoots([...slope].reverse()).filter(Z=>Z!==0).map(Z=>1/Z)]
    .filter(Number.isFinite).sort((a,b)=>direction*(a-b))
  const startZ=zFromZc(seed.zc)
  const z=roots.find(root=>{
    if(direction*(root-startZ)<=0||!regularFibreInterval(startZ,root,p))return false
    const h=1e-6*(1+Math.abs(root))
    return slopeAt(root-h)<0&&slopeAt(root+h)>0
  })
  if(z===undefined)
    return direction*(points.at(-1).zc-chainEndpoint[2])>0?{points,minimum:null}:null
  const zc=zcFromZ(z),q=stateFiberPoint(U,z,p,'minus')
  if(q.kind!=='regular'||direction*(zc-chainEndpoint[2])<=0)return null
  const minimum={...q,zc,s:waveState(q.tau,q.Y,z,p).s}
  const prefix=points.filter(point=>direction*(point.zc-zc)<0)
  const last=prefix.at(-1)
  if(!last||Math.abs(last.zc-zc)>.002||!(minimum.s<last.s))return null
  return {points:[...prefix,minimum],minimum}
}

/** Trim only the descending branch that actually contains the sonic point. */
export function trimForwardShockAtSonicPoint(arcs,point) {
  if (!point) return null
  for (const arc of arcs) {
    const direction=Math.sign(arc.at(-1).zc-arc[0].zc)
    if (direction*(point.zc-arc[0].zc)<=0 || direction*(point.zc-arc.at(-1).zc)>0) continue
    const prefix=arc.filter(sample=>direction*(point.zc-sample.zc)>0)
    return [...prefix,point]
  }
  return null
}

export function monotoneShockArcs(U, seed, p, side, speedSign) {
  if (!seed) return []
  const start = stateFiberPoint(U, zFromZc(seed.zc), p, side)
  if (start.kind !== 'regular') return []
  const {s} = waveState(seed.tau, 0, start.z, p)
  if (!finite(s)) return []
  return [-1, 1].flatMap(direction => {
    const points = [{...start, tau:seed.tau, Y:0, zc:seed.zc, s}]
    for (let i = 1; i <= 2000; i++) {
      const zc = seed.zc + direction * i * 0.001
      if (Math.abs(zc) >= 0.999) break
      const z = zFromZc(zc)
      const next = stateFiberPoint(U, z, p, side)
      const previous = points.at(-1)
      if (next.kind !== 'regular' || next.denominator * previous.denominator <= 0 ||
          Math.max(Math.abs(next.tau), Math.abs(next.Y)) > 1e6) break
      const {s} = waveState(next.tau, next.Y, z, p)
      if (!finite(s) || !(speedSign*(s-previous.s)>0)) break
      points.push({...next, zc, s})
    }
    return points.length > 1 ? [points] : []
  })
}

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

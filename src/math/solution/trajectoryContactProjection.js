import {stateCharacteristicDirection} from '../rarefaction/stateIntegralCurves.js'

const distance = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1])
const plus = (a,v,h) => [a[0]+h*v[0],a[1]+h*v[1]]

/** Local RK4 continuation of the characteristic integral curve from a sampled state.
 * The arc parameter is signed distance because eigenvectors are unit length.
 * This is a numerical approximation, not a certified trajectory or boundary-value solution.
 */
export function localCharacteristicAdvance(U,p,family,reference,length,{maxStep=0.0125}={}) {
  if (!Array.isArray(U)||!U.every(Number.isFinite)||!Array.isArray(reference)||!reference.every(Number.isFinite)||!Number.isFinite(length)||length<0||maxStep<=0) return null
  if(!stateCharacteristicDirection(U,p,family,reference))return null
  if(length===0)return [...U]
  const n=Math.ceil(length/maxStep)
  if(n>4096)return null
  const h=length/n
  let current=[...U],ref=reference
  const field=(q,r)=>stateCharacteristicDirection(q,p,family,r)?.direction
  for(let i=0;i<n;i++) {
    const k1=field(current,ref);if(!k1)return null
    const k2=field(plus(current,k1,h/2),k1);if(!k2)return null
    const k3=field(plus(current,k2,h/2),k2);if(!k3)return null
    const k4=field(plus(current,k3,h),k3);if(!k4)return null
    current=[current[0]+h*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6,current[1]+h*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6]
    if(!current.every(Number.isFinite))return null
    ref=k4
  }
  return current
}

/** Closest point on locally re-integrated arcs seeded at each trace sample.
 * A bounded 1D search is used, with both endpoints included. */
export function projectContactToCharacteristicTrace(target,branch,p,{iterations=22,maxStep=0.0125}={}) {
  if(!Array.isArray(target)||!target.every(Number.isFinite)||!branch?.points||branch.points.length<2)return null
  let best=null
  for(let i=0;i<branch.points.length-1;i++) {
    const a=branch.points[i],b=branch.points[i+1]
    const len=distance(a,b)
    if(!Number.isFinite(len)||len<=1e-12)continue
    const ref=[(b[0]-a[0])/len,(b[1]-a[1])/len]
    const evalAt=t=>{
      const point=localCharacteristicAdvance(a,p,branch.family,ref,t*len,{maxStep})
      return point?{point,distance:distance(point,target),segmentIndex:i,segmentFraction:t}:null
    }
    let lo=0,hi=1
    const phi=(Math.sqrt(5)-1)/2
    let x=hi-phi*(hi-lo),y=lo+phi*(hi-lo)
    let fx=evalAt(x),fy=evalAt(y)
    for(let j=0;j<iterations;j++) {
      if(!fx||!fy)break
      if(fx.distance<=fy.distance){hi=y;y=x;fy=fx;x=hi-phi*(hi-lo);fx=evalAt(x)}
      else{lo=x;x=y;fx=fy;y=lo+phi*(hi-lo);fy=evalAt(y)}
    }
    for(const candidate of [evalAt(0),evalAt(1),fx,fy])if(candidate&&(!best||candidate.distance<best.distance))best=candidate
  }
  return best
}

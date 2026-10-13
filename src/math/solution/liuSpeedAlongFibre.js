import {directShockDiagnostic} from './directShockDiagnostic.js'

/** Sampled necessary Liu speed ordering along an explicitly ordered forward
 * Hugoniot arc from a fixed left state to a target right state. This is not a
 * global Liu certification: an unsampled turn or a different arc may exist.
 * The caller must supply the correct connected arc and its orientation. */
export function liuSpeedAlongFibre(fixedLeft, arc, p, {
  relativeTolerance=1e-7, speedTolerance=1e-7, endpointTolerance=1e-5,
}={}) {
  const points=arc?.map(q=>Array.isArray(q)?q:[q?.u,q?.v])
  if(!Array.isArray(fixedLeft)||fixedLeft.length!==2||!fixedLeft.every(Number.isFinite)||
    !Array.isArray(points)||points.length<2||points.some(q=>q?.length!==2||!q.every(Number.isFinite)))
    return {status:'invalid-arc',passes:false}
  const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])
  const endpoint=points.at(-1)
  const scale=1+Math.max(Math.hypot(...fixedLeft),Math.hypot(...endpoint))
  if(distance(points[0],fixedLeft)>endpointTolerance*scale)
    return {status:'unanchored-arc',passes:false}
  const target=directShockDiagnostic(fixedLeft,endpoint,p,{relativeTolerance})
  if(target.kind!=='jump'||!target.rankineHugoniot)
    return {status:'invalid-target-shock',passes:false}
  const speeds=[]
  for(const point of points.slice(1,-1)) {
    if(distance(point,fixedLeft)<=1e-12)continue
    const shock=directShockDiagnostic(fixedLeft,point,p,{relativeTolerance})
    if(shock.kind!=='jump'||!shock.rankineHugoniot)
      return {status:'off-hugoniot-arc',passes:false,checked:speeds.length}
    speeds.push(shock.speed)
  }
  if(!speeds.length)return {status:'insufficient-intermediate-samples',passes:false}
  const eps=speedTolerance*(1+Math.max(Math.abs(target.speed),...speeds.map(Math.abs)))
  // Forward Liu: s(U_L,U_target) <= s(U_L,U) for every intermediate U.
  const violations=speeds.map((speed,i)=>({index:i+1,speed})).filter(q=>target.speed>q.speed+eps)
  return {status:violations.length?'sampled-liu-violation':'sampled-liu-compatible',
    passes:violations.length===0,checked:speeds.length,targetSpeed:target.speed,
    minimumIntermediateSpeed:Math.min(...speeds),violations,
    qualification:'necessary sampled forward-arc test only'}
}

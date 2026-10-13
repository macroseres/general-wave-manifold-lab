import {refinedBackwardLiuInterior} from './backwardLiuInterior.js'
import {directShockDiagnostic} from './directShockDiagnostic.js'
import {traceSeededBackwardHugoniot} from './seededBackwardHugoniot.js'

const finitePoint=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])

/** Necessary sampled backward Liu ordering, with U_R fixed.
 * arc is ordered from U_R (trivial end) to the candidate U_-.
 * For every intermediate V: s(U_-,U_R) >= s(V,U_R).
 * This is NOT an entropy certificate or a global Liu proof.
 */
export function liuSpeedAlongBackwardFibre(right,arc,p,{
  relativeTolerance=1e-7,speedTolerance=1e-7,endpointTolerance=1e-5,
}={}){
  const points=arc?.map(q=>Array.isArray(q)?q:[q?.u,q?.v])
  if(!finitePoint(right)||!Array.isArray(points)||points.length<3||points.some(q=>!finitePoint(q)))
    return {status:'invalid-arc',passes:false}
  const target=points.at(-1),scale=1+Math.max(Math.hypot(...right),Math.hypot(...target))
  if(dist(points[0],right)>endpointTolerance*scale)
    return {status:'unanchored-arc',passes:false}
  const shock=directShockDiagnostic(target,right,p,{relativeTolerance})
  if(shock.kind!=='jump'||!shock.rankineHugoniot)
    return {status:'invalid-target-shock',passes:false}
  const speeds=[]
  for(const [i,point] of points.slice(1,-1).entries()){
    if(dist(point,right)<=1e-12)continue
    const intermediate=directShockDiagnostic(point,right,p,{relativeTolerance})
    if(intermediate.kind!=='jump'||!intermediate.rankineHugoniot)
      return {status:'off-hugoniot-arc',passes:false,checked:speeds.length}
    speeds.push({index:i+1,speed:intermediate.speed})
  }
  if(!speeds.length)return {status:'insufficient-intermediate-samples',passes:false}
  const eps=speedTolerance*(1+Math.max(Math.abs(shock.speed),...speeds.map(q=>Math.abs(q.speed))))
  const violations=speeds.filter(q=>shock.speed<q.speed-eps)
  return {status:violations.length?'sampled-backward-liu-violation':'sampled-backward-liu-compatible',
    passes:violations.length===0,checked:speeds.length,targetSpeed:shock.speed,
    maximumIntermediateSpeed:Math.max(...speeds.map(q=>q.speed)),violations,
    qualification:'Necessary backward Liu speed ordering on sampled arc; no global or entropy certification'}
}

export function seededLiuAtBackwardContact(right,contact,p,options={}){
  const traced=traceSeededBackwardHugoniot(right,contact,p,options)
  if(!traced.arc)return {status:traced.status,passes:false,arcStatus:traced.status}
  const result=liuSpeedAlongBackwardFibre(right,traced.arc,p,options)
  const interior=refinedBackwardLiuInterior(right,traced.arc,p,options)
  const violation=result.status==='sampled-backward-liu-violation'||
    interior.status==='refined-backward-liu-violation'||
    interior.stationaryOrdering?.status==='stationary-backward-liu-violation'
  const inconclusive=!violation&&(interior.status!=='refined-backward-liu-compatible'||
    interior.tangentialRefinement?.status!=='refined-candidates'||
    interior.stationaryOrdering?.status!=='stationary-no-violation-detected')
  return {...result,status:violation?'preliminary-backward-liu-violation':
    inconclusive?'preliminary-backward-liu-inconclusive':'preliminary-backward-liu-no-violation-detected',
    passes:false,sampledLiuPasses:result.passes,arcStatus:traced.status,interior,
    qualification:'Backward sampled, interior and tangential Liu checks; no global certification'}
}

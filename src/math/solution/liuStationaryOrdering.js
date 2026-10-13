import {directShockDiagnostic} from './directShockDiagnostic.js'

const finitePoint=q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)

/** Compare the target speed with numerically refined stationary-speed candidates.
 * This is a necessary sampled test, never a continuous Liu certificate.
 */
export function liuStationaryOrdering(fixed,target,refinement,p,{
  relativeTolerance=1e-7,speedTolerance=1e-7,
}={}){
  if(!finitePoint(fixed)||!finitePoint(target)||!refinement||
    !Number.isFinite(relativeTolerance)||relativeTolerance<=0||
    !Number.isFinite(speedTolerance)||speedTolerance<=0)
    return {status:'invalid-input',passes:false}
  const endpoint=directShockDiagnostic(fixed,target,p,{relativeTolerance})
  if(endpoint.kind!=='jump'||!endpoint.rankineHugoniot)
    return {status:'invalid-target',passes:false}
  const roots=refinement.roots
  if(!Array.isArray(roots))return {status:'unavailable',passes:false}
  const checked=[],violations=[]
  for(const root of roots){
    if(root.status!=='refined-candidate')continue // near-zero samples are not refined extrema
    if(!finitePoint(root.point))return {status:'inconclusive',passes:false,checked,violations}
    const shock=directShockDiagnostic(fixed,root.point,p,{relativeTolerance})
    if(shock.kind!=='jump'||!shock.rankineHugoniot)
      return {status:'inconclusive',passes:false,checked,violations}
    const tolerance=speedTolerance*(1+Math.max(Math.abs(endpoint.speed),Math.abs(shock.speed)))
    const item={point:root.point,speed:shock.speed,derivative:root.derivative}
    checked.push(item)
    if(endpoint.speed>shock.speed+tolerance)violations.push(item)
  }
  const unresolved=(refinement.unresolved??0)>0||refinement.status==='partially-refined'
  return {status:violations.length?'stationary-liu-violation':unresolved?'stationary-inconclusive':'stationary-no-violation-detected',
    passes:false,checked,violations,unresolved,
    targetSpeed:endpoint.speed,
    qualification:'necessary comparison at numerically refined stationary candidates; not continuous Liu certification'}
}

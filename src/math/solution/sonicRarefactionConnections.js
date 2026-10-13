import {stateCharacteristicDirection} from '../rarefaction/stateIntegralCurves.js'
import {projectContactToCharacteristicTrace} from './trajectoryContactProjection.js'
import {sonicShockAdmissibility} from './sonicShockAdmissibility.js'

/**
 * Necessary geometric and speed-order checks for finite-sonic contact matches.
 * A right-anchored branch is stored from U_R backwards, so its characteristic
 * speeds must decrease as the trace moves away from U_R. No entropy assertion.
 */
export function sonicRarefactionConnections(contacts, branches, p, {
  distanceTolerance=0.025, speedTolerance=1e-5, orderingTolerance=1e-7,
  riemannStates=null,
}={}) {
  const results=[]
  for (const side of ['left','right']) for (const contact of contacts?.[side] ?? []) {
    const root=contact.refinement
    if (root?.status!=='converged' || !Array.isArray(root.point) || !root.point.every(Number.isFinite)) continue
    const branchSide=side==='left'?'right':'left'
    const expectedSonicSide=side==='left'?'plus':'minus'
    if (contact.sonicSide!==expectedSonicSide) continue
    const compatible=(branches??[]).filter(b=>b.side===branchSide && b.family===contact.family && b.points?.length>=2)
    for (const branch of compatible) {
      const best=projectContactToCharacteristicTrace(root.point,branch,p)
      if(!best)continue
      const eigen=stateCharacteristicDirection(root.point,p,contact.family)
      const speedMismatch=eigen?Math.abs(root.speed-eigen.lambda):Infinity
      const scale=1+Math.abs(root.speed)
      const distanceScale=1+Math.hypot(...root.point)
      // Recheck the entire used part of the trace, including the final partial
      // segment. This prevents a geometric crossing from silently bypassing a
      // characteristic-speed reversal in externally supplied branch samples.
      const used=[...branch.points.slice(0,best.segmentIndex+1),best.point]
      const speeds=used.map(q=>stateCharacteristicDirection(q,p,contact.family)?.lambda)
      const orientation=branchSide==='left'?1:-1
      const ordered=speeds.every((value,i)=>Number.isFinite(value) && (i===0 ||
        orientation*(value-speeds[i-1])>=-orderingTolerance*(1+Math.abs(value))))
      const endpointSpeed=speeds.at(-1)
      const endpointMismatch=Number.isFinite(endpointSpeed)?Math.abs(endpointSpeed-root.speed):Infinity
      const matched=best.distance<=distanceTolerance*distanceScale &&
        speedMismatch<=speedTolerance*scale && ordered &&
        endpointMismatch<=speedTolerance*scale+best.distance*(1+Math.abs(root.speed))
      const fixed=side==='left'?riemannStates?.left:riemannStates?.right
      const shockAdmissibility=fixed?sonicShockAdmissibility(
        side==='left'?fixed:root.point,side==='left'?root.point:fixed,p,contact.family,contact.sonicSide
      ):null
      const status=!matched?(ordered?'unmatched':'speed-order-reversal'):
        shockAdmissibility&&!shockAdmissibility.passes?'shock-endpoint-rejected':
        shockAdmissibility?'weak-lax-candidate':'ordered-geometric-candidate'
      results.push({contactSide:side,sonicSide:contact.sonicSide,family:contact.family,
        kind:side==='left'?'shock-rarefaction':'rarefaction-shock',point:root.point,
        distance:best.distance,speedMismatch,endpointMismatch,ordered,projectionMethod:'local-rk4-arc',
        segmentIndex:best.segmentIndex,segmentFraction:best.segmentFraction,
        status,shockAdmissibility,branchSide,
        rhResidual:root.rhResidual,sonicResidual:root.sonicResidual})
    }
  }
  return results
}

import {refinedLiuInterior} from './liuInteriorExtrema.js'
import {assessForwardLiuArc} from './liuArcAssessment.js'
import {traceSeededForwardHugoniot} from "./seededForwardHugoniot.js"
import {attachForwardSonicEndpoint} from "./seededContactEndpoint.js"
import {liuSpeedAlongFibre} from './liuSpeedAlongFibre.js'
import {continueSampledForwardHugoniot} from './forwardHugoniotContinuation.js'
import {pseudoArcForwardHugoniot} from './pseudoArcHugoniot.js'

const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])
const asPoint=q=>Array.isArray(q)?q:[q?.u,q?.v]

/** Select a sampled connected forward Hugoniot arc by proximity to its
 * fixed-state origin and finite sonic endpoint. Does not invent missing
 * segments or certify an unsampled continuation. */
export function orientedForwardLiuArc(fixed, target, segments, {
  anchorTolerance=0.05, targetTolerance=0.05,
}={}) {
  if(![fixed,target].every(q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)))
    return {status:'invalid-endpoints',arc:null}
  const scale=1+Math.max(Math.hypot(...fixed),Math.hypot(...target))
  const candidates=[]
  for(const [segmentIndex,segment] of (segments??[]).entries()) {
    const points=(segment.points??[]).map(asPoint)
    if(points.length<3||points.some(q=>q.length!==2||!q.every(Number.isFinite)))continue
    // The fixed state must be at a sampled segment endpoint; otherwise the
    // topology and orientation of the intervening arc are not established.
    for(const ordered of [points,[...points].reverse()]) {
      const anchorError=dist(ordered[0],fixed)
      if(anchorError>anchorTolerance*scale)continue
      for(let j=2;j<ordered.length;j++) {
        const targetError=dist(ordered[j],target)
        if(targetError<=targetTolerance*scale)
          candidates.push({segmentIndex,anchorError,targetError,arc:[fixed,...ordered.slice(1,j),target]})
      }
    }
  }
  if(!candidates.length)return {status:'arc-not-resolved',arc:null}
  candidates.sort((a,b)=>(a.anchorError+a.targetError)-(b.anchorError+b.targetError))
  const best=candidates[0]
  // Multiple similarly plausible paths must not be arbitrarily selected.
  if(candidates.some(q=>q!==best && q.segmentIndex!==best.segmentIndex &&
      Math.abs(q.anchorError+q.targetError-best.anchorError-best.targetError)<1e-6*scale))
    return {status:'ambiguous-arc',arc:null}
  return {status:'sampled-arc',...best,numberOfCandidates:candidates.length}
}

export function sampledLiuAtForwardContact(fixed,contact,segments,p,options={}) {
  const target=contact?.refinement?.status==='converged'?contact.refinement.point:null
  const selection=orientedForwardLiuArc(fixed,target,segments,options)
  if(!selection.arc)return {status:selection.status,passes:false}
  // Prefer branch-guided pseudo-arclength; retain the earlier local corrector
  // as a conservative fallback when the numerical guide is insufficient.
  const pseudo=pseudoArcForwardHugoniot(fixed,selection.arc,p,options)
  const continuation=pseudo.arc?{...pseudo,inserted:pseudo.arc.length-selection.arc.length}:
    continueSampledForwardHugoniot(fixed,selection.arc,p,options)
  if(!continuation.arc)return {status:continuation.status,passes:false,arcStatus:selection.status}
  const result=liuSpeedAlongFibre(fixed,continuation.arc,p,options)
  return {...result,continuationStatus:continuation.status,inserted:continuation.inserted,arcStatus:selection.status,segmentIndex:selection.segmentIndex,
    anchorError:selection.anchorError,targetError:selection.targetError}
}

/** Independent exploratory continuation from characteristic seeds, without
 * sampled geometry. The Liu result is explicitly preliminary because reaching
 * a target neighbourhood does not certify the exact sonic endpoint. */
export function seededLiuAtForwardContact(fixed,contact,p,options={}){
  const target=contact?.refinement?.status==='converged'?contact.refinement.point:null
  if(!target)return {status:'unrefined-contact',passes:false}
  const traced=traceSeededForwardHugoniot(fixed,target,p,options)
  if(!traced.arc)return {status:traced.status,passes:false}
  const endpoint=attachForwardSonicEndpoint(fixed,traced.arc,target,p,options)
  if(!endpoint.arc)return {status:`endpoint-${endpoint.status}`,passes:false,continuationStatus:traced.status}
  const liu=liuSpeedAlongFibre(fixed,endpoint.arc,p,options)
  const interior=refinedLiuInterior(fixed,endpoint.arc,p,options)
  const assessment=assessForwardLiuArc(liu,interior)
  return {...liu,assessment,status:`preliminary-${liu.status}`,passes:false,
    sampledLiuPasses:liu.passes,interiorStatus:interior.status,
    interiorChecked:interior.checked??0,interiorViolations:interior.violations?.length??0,
    interiorExtrema:interior.extrema?.length??0,
    stationaryLiuStatus:interior.stationaryOrdering?.status??'unavailable',
    stationaryLiuViolations:interior.stationaryOrdering?.violations?.length??0,
    stationaryLiuChecked:interior.stationaryOrdering?.checked?.length??0,continuationStatus:traced.status,endpointStatus:endpoint.status,
    endpointGap:endpoint.gap,endpointResidual:endpoint.relativeResidual,
    qualification:'sampled Liu along a seed-traced arc with RH-validated local endpoint; not a global Liu or entropy certificate'}
}

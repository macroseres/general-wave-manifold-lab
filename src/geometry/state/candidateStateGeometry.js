import {directShockDiagnostic} from '../../math/solution/directShockDiagnostic.js'
import {traceSeededForwardHugoniot} from '../../math/solution/seededForwardHugoniot.js'
import {attachForwardSonicEndpoint} from '../../math/solution/seededContactEndpoint.js'

const valid=U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])

/** Adapt existing candidate formats without changing their mathematical evidence. */
export function candidateSegments(candidate){
  if(candidate?.status!=='sampled-candidate')return []
  if(candidate.segments)return candidate.segments
  if(candidate.kind==='two-rarefaction')return candidate.fans.map(f=>({...f,type:'rarefaction',from:f.states[0],to:f.states.at(-1)}))
  const waves=candidate.provenance?.waves??[]
  if(candidate.kind==='two-shock')return candidate.speeds.map((speed,i)=>({type:'shock',family:waves[i]?.family??(i?'fast':'slow'),from:candidate.states[i],to:candidate.states[i+1],speed}))
  const rareFirst=candidate.kind==='rarefaction-shock'
  if(!rareFirst&&candidate.kind!=='shock-rarefaction')return []
  const rare={type:'rarefaction',family:rareFirst?'slow':'fast',states:candidate.fanStates,speeds:candidate.fanSpeeds,
    from:rareFirst?candidate.left:candidate.middle,to:rareFirst?candidate.middle:candidate.right}
  const shock={type:'shock',family:rareFirst?'fast':'slow',speed:candidate.shockSpeed,
    from:rareFirst?candidate.middle:candidate.left,to:rareFirst?candidate.right:candidate.middle}
  return rareFirst?[rare,shock]:[shock,rare]
}

/** Independent state-space shock layer. No projected manifold curve is used.
 * Endpoint exchange reuses RH geometry only, never reverses an entropy test.
 */
export function stateShockArc(segment,p){
  if(!valid(segment?.from)||!valid(segment?.to))return {status:'invalid-endpoints',points:[]}
  const rh=directShockDiagnostic(segment.from,segment.to,p)
  if(!rh.rankineHugoniot)return {status:'rh-unverified',points:[],rh}
  for(const reverse of [false,true]){
    const fixed=reverse?segment.to:segment.from,target=reverse?segment.from:segment.to
    const scale=1+Math.max(Math.hypot(...fixed),Math.hypot(...target))
    const amplitude=distance(fixed,target)/scale
    const step=Math.min(.01,amplitude/12)
    const traced=traceSeededForwardHugoniot(fixed,target,p,{family:segment.family,step,
      seedRadius:Math.min(.001,amplitude/40),targetTolerance:step*1.5,minStep:Math.min(1e-5,step/100),maxSteps:1200})
    if(!traced.arc)continue
    const attached=attachForwardSonicEndpoint(fixed,traced.arc,target,p,{maxGap:step*2,maxTransverse:step*.5})
    if(!attached.arc)continue
    const points=reverse?[...attached.arc].reverse():attached.arc
    return {status:'numerically-connected',points,rh,reverse,family:segment.family,
      qualification:'Continuação RH amostrada; sem certificação global de ramo, Liu ou entropia.'}
  }
  return {status:'continuation-inconclusive',points:[],rh}
}

export function candidateStateGeometry(candidate,p){
  const segments=candidateSegments(candidate).map((segment,index)=>({...segment,index,
    arc:segment.type==='shock'?stateShockArc(segment,p):null,
    rh:segment.type==='rarefaction'?null:directShockDiagnostic(segment.from,segment.to,p)}))
  const points=segments.flatMap(s=>s.type==='shock'?s.arc.points.length?s.arc.points:[s.from,s.to]:s.states??[s.from,s.to]).filter(valid)
  const junctions=candidate?.blocks?.filter(b=>b.type==='K').map(b=>b.sonicJunction)??[]
  return {segments,points,junctions,complete:segments.length>0&&segments.every(s=>s.type!=='shock'||s.arc.points.length>1)}
}

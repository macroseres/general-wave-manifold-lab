import {candidateSegments} from '../../geometry/state/candidateStateGeometry.js'
import {directShockDiagnostic} from './directShockDiagnostic.js'
import {flux} from '../flux/quadraticFlux.js'

const point=U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)
const admissibility=(status='not-evaluated')=>({status,certified:false})
const liuStatus=candidate=>{
  const value=candidate?.evidence?.liu
  return value==='liu-violation-detected'||candidate?.evidence?.status==='liu-violation-detected'||candidate?.evidence?.checks?.liuViolation===true
    ?'sampled-violation-detected'
    :typeof value==='string'?value:'not-evaluated'
}

/**
 * Read-only, per-element diagnostics for an existing state-space candidate.
 * This function does not select solutions, change constructors, or certify entropy.
 */
export function classifyWaveChain(candidate,p){
  const segments=candidateSegments(candidate)
  const waves=segments.map((segment,index)=>{
    const base={index,type:segment.type,family:segment.family??null,
      from:point(segment.from)?[...segment.from]:null,
      to:point(segment.to)?[...segment.to]:null}
    if(segment.type==='shock'||segment.type==='contact'){
      const rh=directShockDiagnostic(segment.from,segment.to,p)
      const speed=segment.speed
      const fLeft=rh.kind==='jump'&&Number.isFinite(speed)?flux(segment.from,p):null
      const fRight=fLeft?flux(segment.to,p):null
      const delta=fLeft?fRight.map((v,i)=>v-fLeft[i]):null
      const residual=delta?.map((v,i)=>v-speed*rh.jump[i])
      const relativeResidual=residual
        ?Math.hypot(...residual)/(1+Math.hypot(...delta)+Math.abs(speed)*rh.magnitude)
        :null
      const conservation={status:relativeResidual!==null&&Number.isFinite(relativeResidual)&&relativeResidual<=1e-8
        ?'numerically-compatible':'unverified',relativeResidual}
      const spectral=rh.kind==='jump'?rh.configuration:null
      const liu=segment.type==='shock'&&candidate?.kind!=='composite-chain'&&candidate?.kind!=='contact-chain'
        ?liuStatus(candidate):'not-evaluated'
      return {...base,conservation,spectral,
        incoming:spectral?.kind==='spectral-interior'?spectral.incoming:null,
        admissibility:{
          lax:admissibility(segment.type==='shock'&&spectral?.kind==='spectral-interior'&&
            (spectral.name==='one-shock'||spectral.name==='two-shock')
            ?'strict-endpoint-configuration':'not-established'),
          liu:admissibility(liu),viscousProfile:admissibility(),
        }}
    }
    if(segment.type==='rarefaction'){
      const speeds=segment.speeds
      const ordered=Array.isArray(speeds)&&speeds.length>=2&&speeds.every(Number.isFinite)&&
        speeds.every((v,i)=>i===0||v>=speeds[i-1])
      return {...base,conservation:{status:'not-applicable',relativeResidual:null},
        spectral:null,incoming:null,
        fan:{status:ordered?'sampled-speed-ordered':'unverified'},
        admissibility:{lax:admissibility('not-applicable'),liu:admissibility('not-applicable'),
          viscousProfile:admissibility('not-evaluated')}}
    }
    return {...base,conservation:{status:'unverified',relativeResidual:null},
      spectral:null,incoming:null,
      admissibility:{lax:admissibility(),liu:admissibility(),viscousProfile:admissibility()}}
  })
  // Diagnostic only: adjacent states and self-similar speed intervals.
  const speedRange=segment=>{
    if(segment.type==='shock'||segment.type==='contact')
      return Number.isFinite(segment.speed)?[segment.speed,segment.speed]:null
    if(segment.type==='rarefaction'&&Array.isArray(segment.speeds)&&segment.speeds.length>=2&&
      segment.speeds.every(Number.isFinite))
      return [Math.min(...segment.speeds),Math.max(...segment.speeds)]
    return null
  }
  const junctions=segments.slice(1).map((segment,i)=>{
    const previous=segments[i],a=previous.to,b=segment.from
    const valid=point(a)&&point(b)
    const distance=valid?Math.hypot(a[0]-b[0],a[1]-b[1]):null
    const scale=valid?1+Math.max(Math.hypot(...a),Math.hypot(...b)):null
    const continuous=valid&&distance<=1e-8*scale
    const left=speedRange(previous),right=speedRange(segment)
    const speedOrdered=left&&right?left[1]<=right[0]+1e-8*(1+Math.max(Math.abs(left[1]),Math.abs(right[0]))):null
    return {index:i,continuity:{status:!valid?'unverified':continuous?'numerically-compatible':'discontinuous',distance},
      speedOrdering:{status:speedOrdered===null?'unverified':speedOrdered?'numerically-compatible':'reversed',
        leftMaximum:left?.[1]??null,rightMinimum:right?.[0]??null}}
  })
  const summary=key=>junctions.some(j=>j[key].status==='discontinuous'||j[key].status==='reversed')
    ?'violation-detected':junctions.some(j=>j[key].status==='unverified')
      ?'unverified':junctions.length?'numerically-compatible':'not-applicable'
  const chainGeometry={continuity:{status:summary('continuity')},
    speedOrdering:{status:summary('speedOrdering')},junctions}
  const jumps=waves.filter(w=>w.type==='shock'||w.type==='contact')
  const conservation=jumps.some(w=>w.conservation.status!=='numerically-compatible')
    ?'unverified':jumps.length?'necessary-rh-checks-passed':waves.length?'not-applicable':'unverified'
  const construction=candidate?.status!=='sampled-candidate'?'inconclusive':
    waves.length===0?'inconclusive':'numerical-candidate'
  return {construction:{status:construction},
    weakSolution:{status:conservation,qualification:'Necessary numerical RH checks only; no distributional proof.'},
    waves,chainGeometry,admissibility:{status:waves.some(w=>w.admissibility.liu.status==='sampled-violation-detected')
      ?'sampled-violation-detected':'not-certified'},
    entropyCertified:false}
}

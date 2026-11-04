import {candidateSegments} from '../../geometry/state/candidateStateGeometry.js'
import {directShockDiagnostic} from './directShockDiagnostic.js'

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
      const conservation=rh.kind==='jump'
        ?{status:rh.rankineHugoniot?'numerically-compatible':'unverified',relativeResidual:rh.relativeResidual}
        :{status:'unverified',relativeResidual:null}
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
  const jumps=waves.filter(w=>w.type==='shock'||w.type==='contact')
  const conservation=jumps.some(w=>w.conservation.status!=='numerically-compatible')
    ?'unverified':jumps.length?'necessary-rh-checks-passed':waves.length?'not-applicable':'unverified'
  const construction=candidate?.status!=='sampled-candidate'?'inconclusive':
    waves.length===0?'inconclusive':'numerical-candidate'
  return {construction:{status:construction},
    weakSolution:{status:conservation,qualification:'Necessary numerical RH checks only; no distributional proof.'},
    waves,admissibility:{status:waves.some(w=>w.admissibility.liu.status==='sampled-violation-detected')
      ?'sampled-violation-detected':'not-certified'},
    entropyCertified:false}
}

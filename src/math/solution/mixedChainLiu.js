import {traceSeededForwardHugoniot} from './seededForwardHugoniot.js'
import {attachForwardSonicEndpoint} from './seededContactEndpoint.js'
import {liuSpeedAlongFibre} from './liuSpeedAlongFibre.js'
import {liuSpeedAlongBackwardFibre} from './backwardLiu.js'
import {directShockDiagnostic} from './directShockDiagnostic.js'

const finite=q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)

/** Sampled necessary Liu condition for the shock of a mixed two-wave chain.
 * Unlike sonic-composite diagnostics, the target is the intermediate state U_M,
 * which is generally NOT sonic. Never reuse a sonic-contact report for it.
 */
export function mixedChainLiuAtMiddle(left,middle,right,p,kind,options={}){
  if(![left,middle,right].every(finite)||!['rarefaction-shock','shock-rarefaction'].includes(kind))
    return {status:'invalid-input',entropyCertified:false}
  const forward=kind==='shock-rarefaction'
  const fixed=forward?left:right
  const shock=forward?directShockDiagnostic(left,middle,p):directShockDiagnostic(middle,right,p)
  if(shock.kind!=='jump'||!shock.rankineHugoniot)
    return {status:'invalid-shock',entropyCertified:false}
  const trace=traceSeededForwardHugoniot(fixed,middle,p,{
    maxSteps:options.maxSteps??350,step:options.step??0.025,
    targetTolerance:options.targetTolerance??0.025,
    ...(options.family?{family:options.family}:{})
  })
  if(!trace.arc)return {status:'arc-unresolved',reason:trace.status,entropyCertified:false}
  const attached=attachForwardSonicEndpoint(fixed,trace.arc,middle,p,options)
  if(!attached.arc)return {status:'endpoint-unresolved',reason:attached.status,entropyCertified:false}
  const check=forward?liuSpeedAlongFibre(fixed,attached.arc,p,options):
    liuSpeedAlongBackwardFibre(fixed,attached.arc,p,options)
  const violation=forward?check.status==='sampled-liu-violation':check.status==='sampled-backward-liu-violation'
  const noViolation=forward?check.status==='sampled-liu-compatible':check.status==='sampled-backward-liu-compatible'
  return {status:violation?'liu-violation-detected':noViolation?'no-sampled-violation':'inconclusive',
    direction:forward?'forward':'backward',checked:check.checked??0,
    shockSpeed:shock.speed,reason:check.status,entropyCertified:false}
}

/** Expensive continuation is restricted to the first few plausible candidates. */
export function assessMixedChainsWithLiu(candidates,states,p,{maxEvaluations=6,...options}={}){
  let evaluated=0
  return (candidates??[]).map(candidate=>{
    if(candidate.evidence?.status!=='mixed-ordered-lax-candidate')
      return {...candidate,liu:{status:'prerequisites-not-met',entropyCertified:false}}
    if(evaluated>=maxEvaluations)
      return {...candidate,liu:{status:'not-evaluated-limit',entropyCertified:false}}
    evaluated++
    const middle=candidate.refinement?.status==='refined-candidate'?candidate.refinement.middle:candidate.middle
    // A sampled-polyline intersection is not an established RH endpoint.
    if(candidate.refinement?.status!=='refined-candidate')
      return {...candidate,liu:{status:'middle-not-refined',entropyCertified:false}}
    return {...candidate,liu:mixedChainLiuAtMiddle(states?.left,middle,states?.right,p,candidate.kind,options)}
  })
}

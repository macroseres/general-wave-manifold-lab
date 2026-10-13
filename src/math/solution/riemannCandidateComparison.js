import {directShockDiagnostic} from './directShockDiagnostic.js'

const valid=U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)
const middleOf=q=>q?.kind==='two-shock'?q.states?.[1]:q?.middle
const finite=x=>Number.isFinite(x)?x:null

/** Diagnostic comparison, not a ranking of entropy solutions. */
export function compareRiemannCandidates(candidates,p){
  return (candidates??[]).map((candidate,index)=>{
    const middle=middleOf(candidate)
    const left=candidate.kind==='two-shock'?candidate.states?.[0]:candidate.left
    const right=candidate.kind==='two-shock'?candidate.states?.[2]:candidate.right
    if(candidate.status!=='sampled-candidate'||![left,middle,right].every(valid)){
      return {index,status:'invalid-profile',middle:valid(middle)?[...middle]:null,entropyCertified:false}
    }
    const first=candidate.kind==='rarefaction-shock'?null:directShockDiagnostic(left,middle,p)
    const second=candidate.kind==='shock-rarefaction'?null:directShockDiagnostic(middle,right,p)
    const shocks=[first,second].filter(Boolean)
    const residuals=shocks.map(q=>finite(q.relativeResidual))
    const speeds=candidate.kind==='two-shock'?[...candidate.speeds]:[candidate.shockSpeed]
    const fanSpeeds=Array.isArray(candidate.fanSpeeds)?[candidate.fanSpeeds[0],candidate.fanSpeeds.at(-1)]:null
    const gap=candidate.kind==='two-shock'?speeds[1]-speeds[0]:
      candidate.kind==='rarefaction-shock'?speeds[0]-fanSpeeds?.[1]:fanSpeeds?.[0]-speeds[0]
    const evidence=candidate.evidence??{}
    const violation=evidence.status==='liu-violation-detected'||evidence.checks?.liuViolation===true
    const residualOK=residuals.length>0&&residuals.every(v=>v!==null&&v<=1e-8)
    const ordered=Number.isFinite(gap)&&gap>0
    return {
      index,status:violation?'liu-violation-detected':!residualOK?'rh-unverified':!ordered?'unordered-speeds':'numerical-candidate',
      kind:candidate.kind,middle:[...middle],shockSpeeds:speeds,fanSpeedRange:fanSpeeds,
      speedGap:finite(gap),relativeShockResiduals:residuals,maxRelativeShockResidual:residuals.every(v=>v!==null)?Math.max(...residuals):null,
      geometry:evidence.geometry??'not-evaluated',lax:evidence.lax??'not-evaluated',
      fan:evidence.fan??'not-evaluated',liu:evidence.liu??'not-evaluated',
      entropyCertified:false,
    }
  })
}

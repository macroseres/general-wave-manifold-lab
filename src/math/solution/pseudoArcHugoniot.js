import {forwardHugoniotIncidence,forwardHugoniotGradient,correctForwardHugoniotPoint} from './forwardHugoniotContinuation.js'
import {directShockDiagnostic} from './directShockDiagnostic.js'
import {selectCharacteristicForwardSeed} from './characteristicHugoniotSeed.js'

const finite=q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]]
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]]
const mul=(a,t)=>[a[0]*t,a[1]*t]
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]
const norm=a=>Math.hypot(...a)
const segmentDistance=(q,a,b)=>{
  const v=sub(b,a),vv=dot(v,v)
  const t=vv>0?Math.max(0,Math.min(1,dot(sub(q,a),v)/vv)):0
  return {distance:norm(sub(q,add(a,mul(v,t)))),t}
}
const unit=a=>norm(a)>1e-14?mul(a,1/norm(a)):null

/** Predictor-corrector on H(U)=0, with the pseudo-arclength constraint
 * dot(U-predicted,tangent)=0. Can traverse coordinate turning points.
 * A sampled oriented arc is required to constrain branch selection.
 */
export function pseudoArcForwardHugoniot(left,arc,p,{
  step=0.035,minStep=0.0002,maxSteps=1200,tolerance=1e-9,
  maxNewton=15,endpointTolerance=0.018,guideTolerance=0.09,
  minJump=1e-7,
}={}){
  if(!finite(left)||!Array.isArray(arc)||arc.length<3||arc.some(q=>!finite(q))||
     ![step,minStep,tolerance,endpointTolerance,guideTolerance].every(x=>Number.isFinite(x)&&x>0)||
     !Number.isInteger(maxSteps)||maxSteps<1||!Number.isInteger(maxNewton)||maxNewton<1)
    return {status:'invalid-arc',arc:null}
  const scale=1+Math.max(norm(left),...arc.map(norm))
  if(norm(sub(left,arc[0]))>1e-5*scale)return {status:'unanchored-arc',arc:null}
  const characteristicSeed=selectCharacteristicForwardSeed(left,arc,p,{minJump})
  // At coincidence no unique characteristic splitting exists: keep the
  // previous guide-constrained numerical method, without claiming a family.
  if(['guide-not-characteristic','ambiguous-characteristic'].includes(characteristicSeed.status))
    return {status:characteristicSeed.status,arc:null}
  const start=correctForwardHugoniotPoint(left,arc[1],p,{minJump})
  const end=correctForwardHugoniotPoint(left,arc.at(-1),p,{minJump})
  if(start.status!=='converged'||end.status!=='converged')return {status:'endpoint-correction-failed',arc:null}
  const initial=unit(sub(arc[2],arc[1]))
  if(!initial)return {status:'degenerate-guide',arc:null}
  let current=start.point,previousTangent=initial,guideIndex=1
  const points=[left,current]
  const target=end.point
  let h=Math.min(step*scale,norm(sub(arc[2],arc[1])))
  const minimum=minStep*scale
  for(let k=0;k<maxSteps;k++){
    if(norm(sub(current,target))<=endpointTolerance*scale){
      if(norm(sub(current,target))>1e-12)points.push(target)
      return {status:'pseudoarc-sampled-compatible',arc:points,steps:k,characteristicSeedStatus:characteristicSeed.status,characteristicFamily:characteristicSeed.seed?.family??null,qualification:'guide-constrained numerical continuation; no global Liu certificate'}
    }
    const gradient=forwardHugoniotGradient(left,current,p)
    let tangent=unit([-gradient[1],gradient[0]])
    if(!tangent)return {status:'singular-gradient',arc:null,steps:k}
    if(dot(tangent,previousTangent)<0)tangent=mul(tangent,-1)
    let accepted=null,trialStep=h
    for(let retry=0;retry<9&&trialStep>=minimum;retry++,trialStep/=2){
      const predictor=add(current,mul(tangent,trialStep))
      let q=predictor
      for(let j=0;j<maxNewton;j++){
        const f=forwardHugoniotIncidence(left,q,p)
        const g=forwardHugoniotGradient(left,q,p)
        const constraint=dot(sub(q,predictor),tangent)
        const determinant=g[0]*tangent[1]-g[1]*tangent[0]
        if(!Number.isFinite(f)||!g.every(Number.isFinite)||Math.abs(determinant)<1e-14)break
        if(Math.abs(f)<=tolerance*scale**3&&Math.abs(constraint)<=tolerance*scale){
          if(norm(sub(q,left))>minJump&&directShockDiagnostic(left,q,p).rankineHugoniot)accepted=q
          break
        }
        const correction=[(f*tangent[1]-g[1]*constraint)/determinant,
          (g[0]*constraint-f*tangent[0])/determinant]
        if(norm(correction)>2*trialStep)break
        q=sub(q,correction)
      }
      if(!accepted)continue
      // The guide is only a branch constraint, not a proof of global topology.
      let bestIndex=guideIndex,bestDistance=Infinity,bestProgress=0
      for(let i=Math.max(1,guideIndex-1);i<Math.min(arc.length-1,guideIndex+4);i++){
        const {distance,t}=segmentDistance(accepted,arc[i],arc[i+1])
        if(distance<bestDistance){bestDistance=distance;bestIndex=i;bestProgress=i+t}
      }
      if(bestDistance>guideTolerance*scale){accepted=null;continue}
      if(bestProgress+0.1<guideIndex){accepted=null;continue}
      guideIndex=Math.max(guideIndex,bestIndex)
      break
    }
    if(!accepted)return {status:'continuation-unresolved',arc:null,steps:k}
    // Reject loops and backtracking on a previously visited part of the arc.
    if(points.slice(1,-2).some(q=>norm(sub(q,accepted))<minimum*0.4))
      return {status:'loop-detected',arc:null,steps:k}
    points.push(accepted)
    previousTangent=tangent
    current=accepted
    h=Math.min(step*scale,trialStep*1.35)
  }
  return {status:'max-steps',arc:null,steps:maxSteps}
}

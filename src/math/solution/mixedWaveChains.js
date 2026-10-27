import {refineMixedMiddleJoint} from './mixedJointCorrector.js'
import {directShockDiagnostic} from './directShockDiagnostic.js'
import {flux} from '../flux/quadraticFlux.js'
import {classifyLaxShock} from './twoShockFamilyEvidence.js'
import {stateCharacteristicDirection} from '../rarefaction/stateIntegralCurves.js'

const valid = q => Array.isArray(q) && q.length === 2 && q.every(Number.isFinite)
const sub = (a,b) => [a[0]-b[0],a[1]-b[1]]
const cross = (a,b) => a[0]*b[1]-a[1]*b[0]
const distance = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1])
const coords = q => Array.isArray(q) ? q : [q?.u,q?.v]

/** Finite polyline intersections; no extrapolation and no claim of completeness. */
export function intersectWavePolylines(a,b,{parallelTolerance=1e-11}={}) {
  const result=[]
  for(let i=1;i<(a?.length??0);i++)for(let j=1;j<(b?.length??0);j++){
    const A=coords(a[i-1]), B=coords(a[i]), C=coords(b[j-1]), D=coords(b[j])
    if(![A,B,C,D].every(valid))continue
    const r=sub(B,A),s=sub(D,C),den=cross(r,s),scale=Math.hypot(...r)*Math.hypot(...s)
    if(scale<1e-18||Math.abs(den)<=parallelTolerance*scale)continue
    const t=cross(sub(C,A),s)/den, u=cross(sub(C,A),r)/den
    if(t < -1e-10 || t > 1+1e-10 || u < -1e-10 || u > 1+1e-10)continue
    const tc=Math.max(0,Math.min(1,t)),uc=Math.max(0,Math.min(1,u))
    const point=[A[0]+tc*r[0],A[1]+tc*r[1]]
    if(!result.some(q=>distance(q.point,point)<1e-7))result.push({point,aIndex:i-1+tc,bIndex:j-1+uc})
  }
  return result
}

/**
 * Necessary tests for R_s(U_L) -> shock_f -> U_R and
 * U_L -> shock_s -> R_f(U_R). Rarefactions are sampled, not certified.
 */
export function assessMixedWaveChain(left,middle,right,p,kind,family,{speedTolerance=1e-7}={}) {
  if(![left,middle,right].every(valid))return {status:'missing-states',entropyCertified:false}
  if(!['rarefaction-shock','shock-rarefaction'].includes(kind))return {status:'invalid-kind',entropyCertified:false}
  if(!['slow','fast'].includes(family))return {status:'invalid-family',entropyCertified:false}
  const rareFromLeft=kind==='rarefaction-shock'
  if((rareFromLeft&&family!=='slow')||(!rareFromLeft&&family!=='fast'))return {status:'family-order-unverified',kind,rarefactionFamily:family,entropyCertified:false}
  const rareStart=rareFromLeft?left:middle,rareEnd=rareFromLeft?middle:right
  const eigenStart=stateCharacteristicDirection(rareStart,p,family)
  const eigenEnd=stateCharacteristicDirection(rareEnd,p,family)
  if(!eigenStart||!eigenEnd)return {status:'non-strict-hyperbolicity',entropyCertified:false}
  const shock=rareFromLeft?classifyLaxShock(middle,right,p):classifyLaxShock(left,middle,p)
  const expectedShockFamily=family==='slow'?'fast':'slow'
  const laxFamily=shock.families.includes(expectedShockFamily)
  const scale=1+Math.max(Math.abs(eigenStart.lambda),Math.abs(eigenEnd.lambda),Math.abs(shock.shock?.speed??0))
  const eps=speedTolerance*scale
  const fanExpands=eigenEnd.lambda>eigenStart.lambda+eps
  const gap=rareFromLeft?shock.shock?.speed-eigenEnd.lambda:eigenStart.lambda-shock.shock?.speed
  const ordered=Number.isFinite(gap)&&gap>eps
  const status=!shock.shock?.rankineHugoniot?'rankine-hugoniot-unverified':!fanExpands?'fan-not-expansive':!ordered?'speed-ordering-unverified':!laxFamily?'family-lax-unverified':'mixed-ordered-lax-candidate'
  return {status,kind,rarefactionFamily:family,shockFamily:expectedShockFamily,shock,fanSpeedStart:eigenStart.lambda,fanSpeedEnd:eigenEnd.lambda,fanExpands,ordered,speedGap:gap,laxFamily,entropyCertified:false}
}


const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]
const add=(a,b,h)=>[a[0]+h*b[0],a[1]+h*b[1]]

/** One local RK4 characteristic step; direction is aligned to the sampled arc. */
function localCharacteristicStep(U,p,family,length,reference){
  const direction=(q,ref)=>stateCharacteristicDirection(q,p,family,ref)?.direction
  const k1=direction(U,reference);if(!k1)return null
  const k2=direction(add(U,k1,length/2),k1);if(!k2)return null
  const k3=direction(add(U,k2,length/2),k2);if(!k3)return null
  const k4=direction(add(U,k3,length),k3);if(!k4)return null
  return [U[0]+length*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6,
    U[1]+length*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6]
}

/** Refine a sampled intersection on a locally reintegrated rarefaction.
 * The scalar shock incidence vanishes only when Rankine–Hugoniot can hold.
 * A root is accepted only inside the original segment and with small RH residual.
 */
export function refineMixedMiddle(left,right,branch,p,kind,segmentIndex,options={}){
  const {rootTolerance=1e-9,stateTolerance=2e-4,maxIterations=48}=options
  if(!valid(left)||!valid(right)||!branch?.points||!['slow','fast'].includes(branch.family))return {status:'invalid-input'}
  const a=coords(branch.points[segmentIndex]),b=coords(branch.points[segmentIndex+1])
  if(!valid(a)||!valid(b))return {status:'invalid-segment'}
  const d=sub(b,a),length=Math.hypot(...d)
  if(length<=1e-12)return {status:'degenerate-segment'}
  const reference=d.map(v=>v/length)
  const direction=stateCharacteristicDirection(a,p,branch.family,reference)?.direction
  if(!direction||dot(direction,reference)<0.8)return {status:'tangent-mismatch'}
  const point=t=>t===0?a:localCharacteristicStep(a,p,branch.family,length*t,reference)
  const incidence=U=>{
    const fixed=kind==='rarefaction-shock'?right:left
    const jump=sub(U,fixed),df=sub(flux(U,p),flux(fixed,p))
    return cross(jump,df)
  }
  let lo=0,hi=1,fa=incidence(a),fb=incidence(b)
  // Reintegrated endpoint may differ from the polyline endpoint.
  const end=point(1)
  if(!end)return {status:'integration-failed'}
  fb=incidence(end)
  if(!Number.isFinite(fa)||!Number.isFinite(fb)||fa*fb>0)return {status:'unbracketed'}
  let middle=null
  for(let i=0;i<maxIterations;i++){
    const t=(lo+hi)/2,m=point(t)
    if(!m)return {status:'integration-failed'}
    const fm=incidence(m)
    if(!Number.isFinite(fm))return {status:'integration-failed'}
    middle=m
    if(Math.abs(fm)<rootTolerance||hi-lo<1e-12)break
    if(fa*fm<=0){hi=t;fb=fm}else{lo=t;fa=fm}
  }
  if(!middle)return {status:'integration-failed'}
  const shock=kind==='rarefaction-shock'?directShockDiagnostic(middle,right,p):directShockDiagnostic(left,middle,p)
  if(!shock.rankineHugoniot)return {status:'rh-residual',middle,relativeResidual:shock.relativeResidual}
  // A large departure from the original segment invalidates the sampled intersection.
  const t=Math.max(0,Math.min(1,dot(sub(middle,a),d)/(length*length)))
  const projected=add(a,d,t)
  if(distance(middle,projected)>stateTolerance*(1+length))return {status:'off-sampled-arc',middle}
  return {status:'refined-candidate',middle,relativeResidual:shock.relativeResidual,entropyCertified:false}
}

/** Necessary speed ordering on the complete sampled fan up to U_M.
 * The right-anchored trace is traversed backwards in physical wave order.
 * The final U_M is evaluated directly, rather than using a polyline speed.
 */
export function assessMixedFanArc(branch, middle, p, kind, segmentIndex, {
  speedTolerance=1e-7, joinTolerance=0.05,
}={}) {
  const left=kind==='rarefaction-shock'
  if(!valid(middle)||!branch?.points||!['slow','fast'].includes(branch.family)||
    branch.side!==(left?'left':'right')||!Number.isInteger(segmentIndex)||
    segmentIndex<0||segmentIndex+1>=branch.points.length)
    return {status:'invalid-fan-arc',passes:false}
  const points=branch.points.slice(0,segmentIndex+1).map(coords)
  if(!points.every(valid))return {status:'invalid-fan-arc',passes:false}
  const a=coords(branch.points[segmentIndex]),b=coords(branch.points[segmentIndex+1])
  const d=sub(b,a),length=Math.hypot(...d)
  if(!valid(a)||!valid(b)||length<=1e-12)return {status:'degenerate-fan-segment',passes:false}
  const t=Math.max(0,Math.min(1,dot(sub(middle,a),d)/(length*length)))
  const projection=add(a,d,t),gap=distance(projection,middle)
  if(gap>joinTolerance*(1+length))return {status:'middle-off-fan',passes:false,gap}
  points.push(middle)
  const ordered=left?points:points.reverse()
  const speeds=[]
  for(const point of ordered){
    const eigen=stateCharacteristicDirection(point,p,branch.family)
    if(!eigen)return {status:'non-strict-hyperbolicity',passes:false}
    speeds.push(eigen.lambda)
  }
  for(let i=1;i<speeds.length;i++){
    const eps=speedTolerance*(1+Math.max(Math.abs(speeds[i-1]),Math.abs(speeds[i])))
    if(speeds[i]<speeds[i-1]-eps)return {status:'fan-speed-reversal',passes:false,index:i,speeds}
  }
  const spread=speeds.at(-1)-speeds[0]
  const eps=speedTolerance*(1+Math.max(...speeds.map(Math.abs)))
  if(spread<=eps)return {status:'fan-not-expansive',passes:false,speeds}
  return {status:'sampled-fan-ordered',passes:true,speeds,gap,entropyCertified:false}
}

export function mixedWaveCandidates(states,rarefactions,hugoniot,p,{maxCandidates=80,joinTolerance=0.05}={}) {
  const left=states?.left,right=states?.right
  if(!valid(left)||!valid(right))return []
  const found=[]
  const report={status:'no-candidates-found',sampledIntersections:0,refined:0,
    rejected:[],maxCandidates,complete:false}
  const finish=()=>{report.status=found.some(q=>q.refinement?.status==='refined-candidate'&&
    q.evidence.status==='mixed-ordered-lax-candidate'&&q.fanArc.passes)?'candidates-found':
    report.sampledIntersections?'inconclusive':'no-candidates-found';found.report=report;return found}
  const cases=[
    {kind:'rarefaction-shock',side:'left',hugoniot:hugoniot?.right},
    {kind:'shock-rarefaction',side:'right',hugoniot:hugoniot?.left},
  ]
  for(const spec of cases)for(const branch of rarefactions??[]){
    if(branch.side!==spec.side||!['slow','fast'].includes(branch.family))continue
    for(const curve of spec.hugoniot??[])for(const hit of intersectWavePolylines(branch.points,curve.points)){
      report.sampledIntersections++
      const middle=hit.point
      if(distance(middle,left)<1e-6||distance(middle,right)<1e-6)continue
      if(found.some(q=>q.kind===spec.kind&&q.family===branch.family&&distance(q.middle,middle)<1e-5))continue
      // An intersection of two polylines is only an approximate state.
      // Never accept an unverified Rankine-Hugoniot jump.
      const segmentIndex=Math.floor(hit.aIndex)
      const joint=refineMixedMiddleJoint(left,right,branch,p,spec.kind,segmentIndex,{
        initialFraction:hit.aIndex-segmentIndex,
      })
      const refinement=joint.status==='refined-candidate'?joint:
        refineMixedMiddle(left,right,branch,p,spec.kind,segmentIndex)
      if(refinement.status==='refined-candidate')report.refined++
      else report.rejected.push({kind:spec.kind,branchFamily:branch.family,
        branchIndex:hit.aIndex,curveId:curve.id,status:refinement.status})
      const evaluatedMiddle=refinement.status==='refined-candidate'?refinement.middle:middle
      const fanArc=assessMixedFanArc(branch,evaluatedMiddle,p,spec.kind,Math.floor(hit.aIndex),{joinTolerance})
      const evidence=assessMixedWaveChain(left,evaluatedMiddle,right,p,spec.kind,branch.family)
      if(evidence.status==='mixed-ordered-lax-candidate'&&!fanArc.passes)
        evidence.status='fan-arc-unverified'
      found.push({kind:spec.kind,family:branch.family,middle,branchSign:branch.sign,
        branchIndex:hit.aIndex,hugoniotIndex:hit.bIndex,curveId:curve.id,evidence,refinement,fanArc,
        geometryStatus:'sampled-polyline-intersection',entropyCertified:false})
      if(found.length>=maxCandidates){report.limitReached=true;return finish()}
    }
  }
  return finish()
}

/** Preserve local search limits and numerical failures for inspection. */
export function searchMixedWaveCandidates(...args){
  const candidates=mixedWaveCandidates(...args)
  return {candidates,report:candidates.report??{status:'invalid-input',complete:false}}
}

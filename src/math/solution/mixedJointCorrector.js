import {flux} from '../flux/quadraticFlux.js'
import {stateCharacteristicDirection} from '../rarefaction/stateIntegralCurves.js'
import {directShockDiagnostic} from './directShockDiagnostic.js'

const finite = q => Array.isArray(q) && q.length===2 && q.every(Number.isFinite)
const sub = (a,b) => [a[0]-b[0],a[1]-b[1]]
const norm = a => Math.hypot(...a)
const add = (a,b,h) => [a[0]+h*b[0],a[1]+h*b[1]]

/** One RK4 integration from a sampled state along the chosen characteristic orientation. */
function integrate(a,p,family,reference,length,t){
  if(t===0)return a
  const h=length*t
  const direction=(U,ref)=>stateCharacteristicDirection(U,p,family,ref)?.direction
  const k1=direction(a,reference);if(!k1)return null
  const k2=direction(add(a,k1,h/2),k1);if(!k2)return null
  const k3=direction(add(a,k2,h/2),k2);if(!k3)return null
  const k4=direction(add(a,k3,h),k3);if(!k4)return null
  return [a[0]+h*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6,
    a[1]+h*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6]
}

/** Solve both RH components for (characteristic arc parameter t, shock speed s).
 * The interval t in [0,1] is mandatory; no extrapolation across branches.
 * A small residual is evidence of a numerical candidate, not entropy admissibility.
 */
export function refineMixedMiddleJoint(left,right,branch,p,kind,segmentIndex,{
  initialFraction=0.5,maxIterations=32,relativeTolerance=1e-8,
  stateTolerance=2e-4,
}={}){
  if(!finite(left)||!finite(right)||!['rarefaction-shock','shock-rarefaction'].includes(kind)||
    !['slow','fast'].includes(branch?.family)||!Array.isArray(branch?.points))return {status:'invalid-input'}
  const a=branch.points[segmentIndex],b=branch.points[segmentIndex+1]
  const A=Array.isArray(a)?a:[a?.u,a?.v],B=Array.isArray(b)?b:[b?.u,b?.v]
  if(!finite(A)||!finite(B))return {status:'invalid-segment'}
  const d=sub(B,A),length=norm(d)
  if(length<1e-12)return {status:'degenerate-segment'}
  const reference=d.map(x=>x/length)
  const direction=stateCharacteristicDirection(A,p,branch.family,reference)?.direction
  if(!direction||direction[0]*reference[0]+direction[1]*reference[1]<0.8)return {status:'tangent-mismatch'}
  const fixed=kind==='rarefaction-shock'?right:left
  const Ffixed=flux(fixed,p)
  const point=t=>integrate(A,p,branch.family,reference,length,t)
  const residual=(t,s)=>{
    const U=point(t)
    if(!U)return null
    const jump=sub(U,fixed),delta=sub(flux(U,p),Ffixed)
    return {U,jump,delta,r:[delta[0]-s*jump[0],delta[1]-s*jump[1]]}
  }
  const t0=Math.max(0,Math.min(1,Number.isFinite(initialFraction)?initialFraction:0.5))
  const first=point(t0)
  if(!first)return {status:'integration-failed'}
  const initial=directShockDiagnostic(fixed,first,p)
  if(initial.kind!=='jump')return {status:'trivial-jump'}
  let t=t0,s=initial.speed
  for(let iteration=0;iteration<maxIterations;iteration++){
    const cur=residual(t,s)
    if(!cur)return {status:'integration-failed'}
    const scale=1+norm(cur.delta)+Math.abs(s)*norm(cur.jump)
    if(norm(cur.r)/scale<=relativeTolerance){
      const middle=cur.U
      const projected=add(A,d,Math.max(0,Math.min(1,((middle[0]-A[0])*d[0]+(middle[1]-A[1])*d[1])/(length*length))))
      if(norm(sub(middle,projected))>stateTolerance*(1+length))return {status:'off-sampled-arc',middle}
      const shock=kind==='rarefaction-shock'?directShockDiagnostic(middle,right,p):directShockDiagnostic(left,middle,p)
      if(!shock.rankineHugoniot)return {status:'rh-residual',middle,relativeResidual:shock.relativeResidual}
      return {status:'refined-candidate',middle,speed:shock.speed,parameter:t,
        relativeResidual:shock.relativeResidual,iterations:iteration,entropyCertified:false}
    }
    const eps=1e-5
    const tp=Math.min(1,t+eps),tm=Math.max(0,t-eps)
    if(tp===tm)return {status:'singular-corrector'}
    const plus=residual(tp,s),minus=residual(tm,s)
    if(!plus||!minus)return {status:'integration-failed'}
    const jt=[(plus.r[0]-minus.r[0])/(tp-tm),(plus.r[1]-minus.r[1])/(tp-tm)]
    const js=cur.jump.map(x=>-x)
    const det=jt[0]*js[1]-jt[1]*js[0]
    if(Math.abs(det)<1e-13*(1+norm(jt)*norm(js)))return {status:'singular-corrector'}
    const dt=(-cur.r[0]*js[1]+cur.r[1]*js[0])/det
    const ds=(-jt[0]*cur.r[1]+jt[1]*cur.r[0])/det
    let accepted=false
    for(let k=0;k<18;k++){
      const alpha=2**(-k),nextT=t+alpha*dt,nextS=s+alpha*ds
      if(nextT<0||nextT>1||!Number.isFinite(nextS))continue
      const next=residual(nextT,nextS)
      if(next&&norm(next.r)<norm(cur.r)*(1-1e-4*alpha)){
        t=nextT;s=nextS;accepted=true;break
      }
    }
    if(!accepted)return {status:'line-search-failed'}
  }
  return {status:'iteration-limit'}
}

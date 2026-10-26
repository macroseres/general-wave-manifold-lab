import {stateCharacteristicDirection} from '../rarefaction/stateIntegralCurves.js'

const coords=q=>Array.isArray(q)?q:[q?.u,q?.v]
const valid=q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)
const norm=q=>Math.hypot(...q)
const sub=(a,b)=>a.map((x,i)=>x-b[i])
const add=(a,b,h)=>a.map((x,i)=>x+h*b[i])
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0]

/** Anchored, oriented numerical integral curve; supplied extent is mandatory.
 * Legacy branches without parameters use chord length as a conservative extent.
 */
function curve(branch,p,step){
  const points=branch?.points?.map(coords)
  if(!points||points.length<2||!points.every(valid)||!['slow','fast'].includes(branch.family)||
    ![-1,1].includes(branch.sign))return null
  const initial=stateCharacteristicDirection(points[0],p,branch.family)
  if(!initial)return null
  const reference=initial.direction.map(x=>x*branch.sign)
  const parameters=[0]
  for(let i=1;i<points.length;i++)parameters.push(parameters[i-1]+norm(sub(points[i],points[i-1])))
  if(branch.parameters){
    if(branch.parameters.length!==points.length||branch.parameters[0]!==0||
      !branch.parameters.every((x,i)=>Number.isFinite(x)&&(i===0||x>branch.parameters[i-1])))return null
    parameters.splice(0,parameters.length,...branch.parameters)
  }
  const at=(s,save=false)=>{
    if(!Number.isFinite(s)||s<0||s>parameters.at(-1))return null
    let U=[...points[0]],ref=reference
    const states=[[...U]],arc=[0]
    const count=Math.ceil(s/step),h=count?s/count:0
    for(let i=0;i<count;i++){
      const f=(q,r)=>stateCharacteristicDirection(q,p,branch.family,r)?.direction
      const a=f(U,ref);if(!a)return null
      const b=f(add(U,a,h/2),a);if(!b)return null
      const c=f(add(U,b,h/2),b);if(!c)return null
      const d=f(add(U,c,h),c);if(!d)return null
      U=U.map((x,j)=>x+h*(a[j]+2*b[j]+2*c[j]+d[j])/6)
      ref=f(U,d);if(!ref)return null
      if(save){states.push([...U]);arc.push((i+1)*h)}
    }
    return {U,direction:ref,states,parameters:arc}
  }
  return {at,parameters,extent:parameters.at(-1)}
}

/** Damped Newton for C_left(s)-C_right(t)=0 in bounded branch coordinates.
 * Residual concerns discretized ODEs; it is not an integration-error certificate.
 */
export function refineRarefactionMiddleJoint(left,right,p,seed,options={}){
  const {integrationStep=.01,residualTolerance=1e-10,parameterTolerance=1e-12,
    conditioningTolerance=1e-8,maxIterations=24}=options
  if(![integrationStep,residualTolerance,parameterTolerance,conditioningTolerance].every(x=>Number.isFinite(x)&&x>0)||
    !Number.isInteger(maxIterations)||maxIterations<1||!seed||
    left?.family!=='slow'||right?.family!=='fast'||left.side!=='left'||right.side!=='right')return {status:'invalid-input'}
  const a=curve(left,p,integrationStep),b=curve(right,p,integrationStep)
  if(!a||!b)return {status:'invalid-branch'}
  const initial=(c,index)=>{
    if(!Number.isFinite(index)||index<0||index>c.parameters.length-1)return NaN
    const i=Math.min(Math.floor(index),c.parameters.length-2),f=index-i
    return c.parameters[i]+f*(c.parameters[i+1]-c.parameters[i])
  }
  let s=initial(a,seed.aIndex),t=initial(b,seed.bIndex)
  if(!Number.isFinite(s)||!Number.isFinite(t))return {status:'invalid-seed'}
  for(let iteration=0;iteration<=maxIterations;iteration++){
    const A=a.at(s),B=b.at(t)
    if(!A||!B)return {status:'integration-failed'}
    const r=sub(A.U,B.U),residual=norm(r),scale=1+Math.max(norm(A.U),norm(B.U))
    // Differentiate the actual discretized residual, including one-sided bounds.
    const derivative=(c,x)=>{
      const eps=1e-5*(1+c.extent),lo=Math.max(0,x-eps),hi=Math.min(c.extent,x+eps)
      const low=c.at(lo),high=c.at(hi)
      return low&&high&&hi>lo?sub(high.U,low.U).map(v=>v/(hi-lo)):null
    }
    const j=derivative(a,s),db=derivative(b,t)
    if(!j||!db)return {status:'integration-failed'}
    const k=db.map(x=>-x),det=cross(j,k),transversality=Math.abs(det)/(norm(j)*norm(k))
    if(!Number.isFinite(transversality)||transversality<=conditioningTolerance)return {status:'ill-conditioned',residual,transversality}
    if(residual<=residualTolerance*scale){
      const first=a.at(s,true),second=b.at(t,true)
      return {status:'refined-candidate',middle:A.U.map((x,i)=>(x+B.U[i])/2),
        parameters:[s,t],bounds:[a.extent,b.extent],residual,relativeResidual:residual/scale,
        transversality,conditionNumber:(1+Math.sqrt(Math.max(0,1-transversality*transversality)))/transversality,
        iterations:iteration,integrationStep,curves:[first,second],entropyCertified:false}
    }
    if(iteration===maxIterations)return {status:'iteration-limit',residual}
    const ds=-cross(r,k)/det,dt=-cross(j,r)/det
    let accepted=false
    for(let n=0;n<24;n++){
      const alpha=2**(-n),ns=s+alpha*ds,nt=t+alpha*dt
      if(ns<0||ns>a.extent||nt<0||nt>b.extent)continue
      const X=a.at(ns),Y=b.at(nt)
      if(X&&Y&&norm(sub(X.U,Y.U))<residual*(1-1e-4*alpha)){
        if(Math.max(Math.abs(ns-s),Math.abs(nt-t))<=parameterTolerance)return {status:'stagnation',residual}
        s=ns;t=nt;accepted=true;break
      }
    }
    if(!accepted)return {status:'line-search-failed',residual}
  }
}

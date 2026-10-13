import { zFromZc } from '../charts/zChart.js'
import { adaptiveRK4Step, normalized2 } from '../numerics/integration.js'
import { NUMERICAL_POLICY } from '../numerics/policy.js'
import { rarefactionField } from './field.js'
import { rarefactionSingularities } from './singularities.js'

const N=NUMERICAL_POLICY.rarefaction

/**
 * Separatrices of all finite saddles in the compactified (tau,zc) chart.
 * This is scientific integration, so it belongs to math/, not the renderer.
 */
export function finiteRarefactionSeparatrices(p,tauMin=-2,tauMax=2,{
  step=N.finiteSeparatrixStep,
  maxSteps=N.finiteSeparatrixMaxSteps,
  seed=N.finiteSeparatrixSeed,
  zcLimit=N.orbitZcLimit,
  fieldFloor=N.normalizedFieldFloor,
  returnTolerance=N.finiteSeparatrixReturnTolerance,
  saddleHitTolerance=N.finiteSeparatrixSaddleHitTolerance,
  onIntegrationDiagnostic=null,
}={}){
  const singularities=rarefactionSingularities(p,tauMin,tauMax),curves=[]
  const inside=q=>q.tau>=tauMin&&q.tau<=tauMax&&q.zc>-zcLimit&&q.zc<zcLimit
  const vf=q=>{
    const d=rarefactionField(q.tau,zFromZc(q.zc),p)
    if(d.kind!=='regular')return null
    return normalized2([d.tauDot,d.zcDot],fieldFloor)
  }
  const add=(q,v,h)=>({tau:q.tau+h*v[0],zc:q.zc+h*v[1]})
  const advance=(q,timeDirection,h)=>adaptiveRK4Step(q,h,x=>{
    const v=vf(x); return v&&[timeDirection*v[0],timeDirection*v[1]]
  },add,{absoluteTolerance:N.adaptiveAbsoluteTolerance,relativeTolerance:N.adaptiveRelativeTolerance,
    minStep:N.adaptiveMinStep,maxStep:step,maxReject:N.adaptiveMaxReject,safety:N.adaptiveSafety,
    norm:x=>Math.hypot(x.tau,x.zc),distance:(a,b)=>Math.hypot(a.tau-b.tau,a.zc-b.zc)})

  singularities.forEach((q,si)=>{
    if(q.type!=='sela'||!q.eigenvectors)return
    for(let j=0;j<2;j++)for(const branch of [-1,1]){
      const stable=q.eigenvalues[j]<0,timeDirection=stable?-1:1,v=q.eigenvectors[j]
      const seedPoint={tau:q.tau+branch*seed*v[0],zc:q.zc+branch*seed*v[1]}
      const points=[{tau:q.tau,zc:q.zc},seedPoint]
      let x=seedPoint,targetIndex=null,h=step
      for(let k=0;k<maxSteps;k++){
        const a=advance(x,timeDirection,h)
        if(typeof onIntegrationDiagnostic==='function')onIntegrationDiagnostic({source:'finite-separatrix',singularityIndex:si,eigenIndex:j,branch,stepIndex:k,...a})
        if(a.kind!=='accepted')break
        const nx=a.state;h=Math.abs(a.nextStep)
        if(!inside(nx))break
        if(Math.hypot(nx.tau-q.tau,nx.zc-q.zc)<returnTolerance&&k>8)break
        const hit=singularities.findIndex((r,ri)=>ri!==si&&r.type==='sela'&&Math.hypot(nx.tau-r.tau,nx.zc-r.zc)<saddleHitTolerance)
        if(hit>=0){points.push({tau:singularities[hit].tau,zc:singularities[hit].zc});targetIndex=hit;break}
        points.push(nx);x=nx
      }
      if(points.length>3)curves.push({
        id:`finite:${si}:${stable?'stable':'unstable'}:${branch<0?'-':'+'}`,
        points,stable,branch,timeDirection,eigenIndex:j,singularityIndex:si,targetIndex,
      })
    }
  })

  // A heteroclinic obtained both as Wu(p_i) and Ws(p_j) is one orbit.
  const heteroKeys=new Set(curves.filter(c=>!c.stable&&c.targetIndex!==null).map(c=>`${c.singularityIndex}->${c.targetIndex}`))
  const separatrices=curves.filter(c=>!c.stable||c.targetIndex===null||!heteroKeys.has(`${c.targetIndex}->${c.singularityIndex}`))
  return {singularities,separatrices}
}

import { zFromZc } from '../charts/zChart.js'
import { characteristicSpectrum } from '../characteristic/spectrum.js'
import { adaptiveRK4Step, locateBracketedEvent, normalized2 } from '../numerics/integration.js'
import { NUMERICAL_POLICY } from '../numerics/policy.js'
import { rarefactionField } from './field.js'

const N = NUMERICAL_POLICY.rarefaction
const S = NUMERICAL_POLICY.spectrum

export function rarefactionOrbits(p, tauMin, tauMax, {
  step=N.orbitStep,
  maxSteps=N.orbitMaxSteps,
  zcLimit=N.orbitZcLimit,
  nTau=N.orbitSeedTauCount,
  nZ=N.orbitSeedZCount,
  stagnationTolerance=N.orbitStagnationTolerance,
  fieldFloor=N.normalizedFieldFloor,
  onIntegrationDiagnostic=null,
  seeds=null,
}={}) {
  const inside=q=>q.tau>=tauMin&&q.tau<=tauMax&&Math.abs(q.zc)<zcLimit
  const vf=q=>{
    const d=rarefactionField(q.tau,zFromZc(q.zc),p)
    if(d.kind!=='regular')return null
    return normalized2([d.tauDot,d.zcDot],fieldFloor)
  }
  const add=(q,v,h)=>({tau:q.tau+h*v[0],zc:q.zc+h*v[1]})
  const integrate=(seed,sign)=>{
    const points=[seed];let q=seed,h=step
    for(let k=0;k<maxSteps;k++){
      const a=adaptiveRK4Step(q,h,x=>{const v=vf(x);return v&&[sign*v[0],sign*v[1]]},add,{
        absoluteTolerance:N.adaptiveAbsoluteTolerance,relativeTolerance:N.adaptiveRelativeTolerance,
        minStep:N.adaptiveMinStep,maxStep:step,maxReject:N.adaptiveMaxReject,safety:N.adaptiveSafety,
        norm:x=>Math.hypot(x.tau,x.zc),distance:(a,b)=>Math.hypot(a.tau-b.tau,a.zc-b.zc),
      })
      if (typeof onIntegrationDiagnostic === 'function') onIntegrationDiagnostic({source:'orbit',seed,sign,stepIndex:k,...a})
      if(a.kind!=='accepted')break
      const nq=a.state;h=Math.abs(a.nextStep)
      if(!inside(nq)||Math.hypot(nq.tau-q.tau,nq.zc-q.zc)<stagnationTolerance)break
      points.push(nq);q=nq
    }
    return points
  }
  const result=[]
  const initialSeeds=seeds??Array.from({length:nZ-1},(_,j)=>j+1).filter(j=>j%2===1).flatMap(j=>
    Array.from({length:nTau-1},(_,i)=>i+1).filter(i=>i%2===1).map(i=>({tau:tauMin+i*(tauMax-tauMin)/nTau,zc:-.9+1.8*j/nZ})))
  for(const seed of initialSeeds){
    if(![seed?.tau,seed?.zc].every(Number.isFinite)||!inside(seed))continue
    const joined=integrate(seed,-1).reverse().concat(integrate(seed,1).slice(1))
    if(joined.length>4)result.push(joined)
  }
  return result
}

/** Both time directions of the existing field, retaining the exact seed once. */
export function rarefactionOrbitThrough(seed,p,tauMin,tauMax,options={}){
  return rarefactionOrbits(p,tauMin,tauMax,{...options,seeds:[seed]})[0]??[]
}

function projectedPoint(tau,zc,p){
  const z=zFromZc(zc),spectrum=characteristicSpectrum(tau,z,p)
  if(spectrum.kind!=='regular')return null
  return {u:spectrum.Ubar[0],v:spectrum.Ubar[1],tau,z,zc,branch:spectrum.branch,s:spectrum.s,other:spectrum.other,gap:spectrum.gap,discriminant:spectrum.discriminant}
}

/** Project an already-computed orbit on C to state space. */
export function projectRarefactionOrbitToState(orbit,p){return orbit.map(q=>projectedPoint(q.tau,q.zc,p)).filter(Boolean)}

/** Refine an E crossing on an already-computed orbit chord; no reintegration. */
export function refineCoincidenceCrossing(a,b,p,{
  iterations=S.coincidenceRefinementIterations,
  relativeTolerance=S.coincidenceEventRelativeTolerance,
}={}){
  if(!a||!b||!Number.isFinite(a.gap)||!Number.isFinite(b.gap)||a.gap*b.gap>0)return null
  const scale=1+Math.max(Math.abs(a.s||0),Math.abs(a.other||0),Math.abs(b.s||0),Math.abs(b.other||0))
  const q=locateBracketedEvent(a,b,
    x=>{const y=projectedPoint(x.tau,x.zc,p);return y?y.gap:NaN},
    (x,y,t)=>({tau:x.tau+t*(y.tau-x.tau),zc:x.zc+t*(y.zc-x.zc)}),
    {iterations,valueTolerance:relativeTolerance*scale})
  if(!q)return null
  const projected=projectedPoint(q.tau,q.zc,p)
  return projected?{...projected,branch:'coincidence'}:null
}

/** Segment one integral orbit without breaking its identity at E. */
export function splitProjectedRarefactionByBranch(points,p,{orbitId='orbit'}={}){
  const segments=[];let current=[];let branch=null;let transitionIndex=0
  const flush=()=>{if(current.length>1)segments.push({orbitId,branch,points:current});current=[]}
  for(let i=0;i<points.length;i++){
    const q=points[i]
    if(q.branch!=='slow'&&q.branch!=='fast'){if(current.length)current.push(q);flush();branch=null;continue}
    if(branch===null){branch=q.branch;current=[q];continue}
    if(branch===q.branch){current.push(q);continue}
    const prev=points[i-1],cross=p?refineCoincidenceCrossing(prev,q,p):null
    if(cross){const event={...cross,event:'coincidence',transitionIndex};current.push(event);flush();branch=q.branch;current=[event,q];transitionIndex++}
    else{flush();branch=q.branch;current=[q]}
  }
  flush();return segments
}

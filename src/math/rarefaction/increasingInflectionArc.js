import {adaptiveRK4Step,rk4Step,normalized2} from '../numerics/integration.js'
import {NUMERICAL_POLICY} from '../numerics/policy.js'
import {zFromZc} from '../charts/zChart.js'
import {characteristicSpectrum} from '../characteristic/spectrum.js'
import {sonicData} from '../sonic/sonic.js'
import {rarefactionField} from './field.js'

const N=NUMERICAL_POLICY.rarefaction

/** Prefix from the exact seed to the first inflection or coincidence.
 * Events are refined by re-integrating fractional steps, not chord interpolation.
 */
export function increasingInflectionArc(seed,p,tauMin,tauMax,{step=N.orbitStep,maxSteps=N.orbitMaxSteps,eventTolerance=1e-9,family="slow",speedSign=1,zcLimit=N.orbitZcLimit}={}){
  const points=[],speeds=[]
  let direction=0
  let coincidence=null
  const finish=status=>({points,speeds,status,coincidence,timeDirection:direction,complete:status==='inflection-reached'})
  const inside=q=>[q?.tau,q?.zc].every(Number.isFinite)&&q.tau>=tauMin&&q.tau<=tauMax&&Math.abs(q.zc)<Math.min(zcLimit,1)
  const spectrum=q=>characteristicSpectrum(q.tau,zFromZc(q.zc),p)
  const event=q=>sonicData(q.tau,zFromZc(q.zc),p).K
  const base=q=>{const f=rarefactionField(q.tau,zFromZc(q.zc),p);return f.kind==='regular'?normalized2([f.tauDot,f.zcDot],N.normalizedFieldFloor):null}
  const add=(q,v,h)=>({tau:q.tau+h*v[0],zc:q.zc+h*v[1]})
  if(!inside(seed))return finish('invalid-seed')
  const initial=spectrum(seed),v=base(seed),k0=event(seed)
  if(initial.kind!=='regular'||initial.branch!==family||!v||!Number.isFinite(k0))return finish('unverified-seed')
  points.push({tau:seed.tau,zc:seed.zc});speeds.push(initial.s)
  if(Math.abs(k0)<=eventTolerance)return finish('seed-on-inflection')
  const delta=1e-5*(1+Math.hypot(seed.tau,seed.zc))
  const derivative=(spectrum(add(seed,v,delta)).s-spectrum(add(seed,v,-delta)).s)/(2*delta)
  if(!Number.isFinite(derivative)||Math.abs(derivative)<1e-10)return finish('speed-direction-unresolved')
  direction=speedSign*Math.sign(derivative)
  const field=q=>{const w=base(q);return w&&w.map(x=>direction*x)}
  const atStep=(q,h)=>{
    const half=rk4Step(q,h/2,field,add)
    return half&&rk4Step(half,h/2,field,add)
  }
  const familySign=family==='slow'?-1:1
  const advance=(q,h)=>adaptiveRK4Step(q,h,field,add,{
    absoluteTolerance:N.adaptiveAbsoluteTolerance,relativeTolerance:N.adaptiveRelativeTolerance,
    minStep:N.adaptiveMinStep,maxStep:step,maxReject:N.adaptiveMaxReject,safety:N.adaptiveSafety,
    norm:x=>Math.hypot(x.tau,x.zc),distance:(a,b)=>Math.hypot(a.tau-b.tau,a.zc-b.zc)})
  let current={...seed},k=k0,h=step
  for(let index=0;index<maxSteps;index++){
    const result=advance(current,h)
    if(result.kind!=='accepted')return finish('integration-stopped')
    let next=result.state,nextK=event(next)
    if(!Number.isFinite(nextK))return finish('inflection-unverified')
    let reached=false,eventStep=0
    if(k*nextK<=0||Math.abs(nextK)<=eventTolerance){
      let lo=0,hi=result.stepUsed
      for(let iteration=0;iteration<60;iteration++){
        const mid=(lo+hi)/2,trial=atStep(current,mid)
        if(!trial)return finish('event-refinement-unresolved')
        const value=event(trial)
        if(!Number.isFinite(value))return finish('event-refinement-unresolved')
        next=trial;nextK=value
        if(Math.abs(value)<=eventTolerance){reached=true;eventStep=mid;break}
        if(k*value<=0)hi=mid;else lo=mid
        if(hi-lo<1e-12)return finish('event-refinement-unresolved')
      }
      if(!reached)return finish('event-refinement-unresolved')
    }
    const sampleSteps=reached?Array.from({length:8},(_,i)=>eventStep*(i+1)/8):[result.stepUsed]
    let previousStep=0
    for(const sampleStep of sampleSteps){
      const sample=reached?atStep(current,sampleStep):next
      if(!inside(sample))return finish('window-limit')
      const data=spectrum(sample),last=speeds.at(-1)
      if(data.kind!=='regular')return finish('characteristic-unverified')
      if(familySign*data.gap<=0){
        let lo=previousStep,hi=sampleStep
        let endpoint=points.at(-1),endpointData=spectrum(endpoint)
        for(let iteration=0;iteration<60&&hi-lo>1e-14;iteration++){
          const mid=(lo+hi)/2,trial=atStep(current,mid)
          if(!inside(trial))return finish('event-refinement-unresolved')
          const value=spectrum(trial)
          if(value.kind!=='regular')return finish('event-refinement-unresolved')
          if(familySign*value.gap>0){lo=mid;endpoint=trial;endpointData=value}
          else hi=mid
        }
        if(Math.abs(endpointData.gap)>eventTolerance*(1+Math.abs(endpointData.s)+Math.abs(endpointData.other)))
          return finish('event-refinement-unresolved')
        if(speedSign*(endpointData.s-last)<-1e-12*(1+Math.abs(last)))return finish('speed-stopped')
        if(endpoint!==points.at(-1)){points.push(endpoint);speeds.push(endpointData.s)}
        coincidence=endpoint
        return finish('characteristic-boundary')
      }
      if(!(speedSign*(data.s-last)>1e-12*(1+Math.abs(last))))return finish('speed-stopped')
      if(Math.hypot(sample.tau-points.at(-1).tau,sample.zc-points.at(-1).zc)<1e-12)return finish('stagnation')
      points.push(sample);speeds.push(data.s)
      previousStep=sampleStep
    }
    if(reached)return finish('inflection-reached')
    current=next;k=nextK;h=Math.abs(result.nextStep)
  }
  return finish('step-limit')
}

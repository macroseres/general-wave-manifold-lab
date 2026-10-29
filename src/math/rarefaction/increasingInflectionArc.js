import {adaptiveRK4Step,rk4Step,normalized2} from '../numerics/integration.js'
import {NUMERICAL_POLICY} from '../numerics/policy.js'
import {zFromZc} from '../charts/zChart.js'
import {characteristicSpectrum} from '../characteristic/spectrum.js'
import {sonicData} from '../sonic/sonic.js'
import {rarefactionField} from './field.js'

const N=NUMERICAL_POLICY.rarefaction

/** Prefix from the exact seed in increasing characteristic speed to first J.
 * Events are refined by re-integrating fractional steps, not chord interpolation.
 */
export function increasingInflectionArc(seed,p,tauMin,tauMax,{step=N.orbitStep,maxSteps=N.orbitMaxSteps,eventTolerance=1e-9}={}){
  const points=[],speeds=[]
  let direction=0
  const finish=status=>({points,speeds,status,timeDirection:direction,complete:status==='inflection-reached'})
  const inside=q=>[q?.tau,q?.zc].every(Number.isFinite)&&q.tau>=tauMin&&q.tau<=tauMax&&Math.abs(q.zc)<N.orbitZcLimit
  const spectrum=q=>characteristicSpectrum(q.tau,zFromZc(q.zc),p)
  const event=q=>sonicData(q.tau,zFromZc(q.zc),p).K
  const base=q=>{const f=rarefactionField(q.tau,zFromZc(q.zc),p);return f.kind==='regular'?normalized2([f.tauDot,f.zcDot],N.normalizedFieldFloor):null}
  const add=(q,v,h)=>({tau:q.tau+h*v[0],zc:q.zc+h*v[1]})
  if(!inside(seed))return finish('invalid-seed')
  const initial=spectrum(seed),v=base(seed),k0=event(seed)
  if(initial.kind!=='regular'||initial.branch!=='slow'||!v||!Number.isFinite(k0))return finish('unverified-seed')
  points.push({tau:seed.tau,zc:seed.zc});speeds.push(initial.s)
  if(Math.abs(k0)<=eventTolerance)return finish('seed-on-inflection')
  const delta=1e-5*(1+Math.hypot(seed.tau,seed.zc))
  const derivative=(spectrum(add(seed,v,delta)).s-spectrum(add(seed,v,-delta)).s)/(2*delta)
  if(!Number.isFinite(derivative)||Math.abs(derivative)<1e-10)return finish('speed-direction-unresolved')
  direction=Math.sign(derivative)
  const field=q=>{const w=base(q);return w&&w.map(x=>direction*x)}
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
        const mid=(lo+hi)/2,half=rk4Step(current,mid/2,field,add),trial=half&&rk4Step(half,mid/2,field,add)
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
    const samples=reached?Array.from({length:8},(_,i)=>{
      const h=eventStep*(i+1)/8,half=rk4Step(current,h/2,field,add)
      return half&&rk4Step(half,h/2,field,add)
    }):[next]
    for(const sample of samples){
      if(!inside(sample))return finish('window-limit')
      const data=spectrum(sample),last=speeds.at(-1)
      if(data.kind!=='regular'||data.branch!=='slow')return finish('characteristic-boundary')
      if(!(data.s>last+1e-12*(1+Math.abs(last))))return finish('speed-stopped')
      if(Math.hypot(sample.tau-points.at(-1).tau,sample.zc-points.at(-1).zc)<1e-12)return finish('stagnation')
      points.push(sample);speeds.push(data.s)
    }
    if(reached)return finish('inflection-reached')
    current=next;k=nextK;h=Math.abs(result.nextStep)
  }
  return finish('step-limit')
}

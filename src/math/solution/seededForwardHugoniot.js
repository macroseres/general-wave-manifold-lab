import {characteristicForwardHugoniotSeeds} from './characteristicHugoniotSeed.js'
import {forwardHugoniotIncidence,forwardHugoniotGradient} from './forwardHugoniotContinuation.js'
import {directShockDiagnostic} from './directShockDiagnostic.js'

const finite=q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]]
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]
const norm=a=>Math.hypot(...a)
const unit=a=>norm(a)>1e-14?a.map(x=>x/norm(a)):null

/** Follow a forward Hugoniot component starting at a corrected characteristic
 * seed, without a sampled guide. A target must be reached within tolerance;
 * otherwise no connecting arc is claimed. This is numerical evidence only. */
export function traceSeededForwardHugoniot(left,target,p,{
  family=null,step=0.025,maxSteps=1600,maxNewton=18,
  targetTolerance=0.025,minStep=1e-5,maxRadius=8,
  seedRadius=0.001,incidenceTolerance=1e-10,includeAttempts=false,
}={}){
  if(!finite(left)||!finite(target)||norm(sub(target,left))<1e-8||
    ![step,targetTolerance,minStep,maxRadius,seedRadius,incidenceTolerance].every(x=>Number.isFinite(x)&&x>0)||
    !Number.isInteger(maxSteps)||maxSteps<1||!Number.isInteger(maxNewton)||maxNewton<1)
    return {status:'invalid-input',arc:null}
  const seedResult=characteristicForwardHugoniotSeeds(left,p,{radius:seedRadius})
  if(seedResult.status!=='seeded')return {status:seedResult.status,arc:null}
  const scale=1+Math.max(norm(left),norm(target))
  const candidates=[],attempts=[]
  for(const seed of seedResult.seeds.filter(q=>!family||q.family===family)){
    let current=[...seed.point],tangent=unit(sub(current,left))
    const arc=[left,current]
    let closest=norm(sub(current,target)),reached=false,reason='max-steps'
    for(let k=0;k<maxSteps;k++){
      const error=norm(sub(current,target))
      if(error<closest)closest=error
      if(error<=targetTolerance*scale){reached=true;reason='target-reached';break}
      if(norm(sub(current,left))>maxRadius*scale){reason='radius-limit';break}
      const gradient=forwardHugoniotGradient(left,current,p)
      let direction=unit([-gradient[1],gradient[0]])
      if(!direction){reason='singular-gradient';break}
      if(dot(direction,tangent)<0)direction=direction.map(x=>-x)
      let accepted=null,h=step*scale
      while(h>=minStep*scale && !accepted){
        const predicted=current.map((x,i)=>x+h*direction[i])
        let q=predicted
        for(let j=0;j<maxNewton;j++){
          const f=forwardHugoniotIncidence(left,q,p)
          const g=forwardHugoniotGradient(left,q,p)
          const c=dot(sub(q,predicted),direction)
          const det=g[0]*direction[1]-g[1]*direction[0]
          if(!Number.isFinite(f)||!g.every(Number.isFinite)||Math.abs(det)<1e-15)break
          if(Math.abs(f)<=incidenceTolerance*scale**3&&Math.abs(c)<=incidenceTolerance*scale){
            if(directShockDiagnostic(left,q,p).rankineHugoniot&&norm(sub(q,current))>h*0.25)accepted=q
            break
          }
          const delta=[(f*direction[1]-g[1]*c)/det,(g[0]*c-f*direction[0])/det]
          if(norm(delta)>2*h)break
          q=sub(q,delta)
        }
        if(!accepted)h/=2
      }
      if(!accepted){reason='corrector-failed';break}
      if(arc.slice(1,-3).some(q=>norm(sub(q,accepted))<minStep*scale*2)){
        reason='loop-detected';break
      }
      tangent=unit(sub(accepted,current))
      current=accepted
      arc.push(current)
    }
    if(includeAttempts)attempts.push({family:seed.family,sign:seed.sign,arc,closest,reason})
    if(reached)candidates.push({family:seed.family,sign:seed.sign,arc,closest,reason})
  }
  if(!candidates.length)return {status:'target-not-reached',arc:null,...(includeAttempts?{attempts}:{})}
  candidates.sort((a,b)=>a.closest-b.closest)
  if(candidates.length>1&&Math.abs(candidates[1].closest-candidates[0].closest)<1e-8*scale)
    return {status:'ambiguous-branch',arc:null,...(includeAttempts?{attempts}:{})}
  const best=candidates[0]
  return {status:'seeded-target-approach',...best,...(includeAttempts?{attempts}:{}),qualification:'unconstrained numerical continuation; endpoint proximity is not an exact connection or Liu certificate'}
}

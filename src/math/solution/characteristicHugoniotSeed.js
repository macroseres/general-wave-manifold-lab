import {stateCharacteristicDirection} from '../rarefaction/stateIntegralCurves.js'
import {correctForwardHugoniotPoint} from './forwardHugoniotContinuation.js'

const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]

/** At a strictly hyperbolic state, the nontrivial RH arcs are tangent to
 * characteristic eigenvectors. Small nonzero offsets avoid the trivial
 * double zero of det(Delta U, Delta F) at the fixed state.
 * Seeds are numerical approximations, not existence or entropy certificates.
 */
export function characteristicForwardHugoniotSeeds(left,p,{radius=0.001,minJump=1e-9}={}){
  if(!Array.isArray(left)||left.length!==2||!left.every(Number.isFinite)||
     !Number.isFinite(radius)||radius<=minJump||!Number.isFinite(minJump)||minJump<=0)
    return {status:'invalid-input',seeds:[]}
  const slow=stateCharacteristicDirection(left,p,'slow')
  const fast=stateCharacteristicDirection(left,p,'fast')
  if(!slow||!fast)return {status:'characteristic-unresolved',seeds:[]}
  const seeds=[]
  for(const [family,field] of [['slow',slow],['fast',fast]]){
    for(const sign of [-1,1]){
      const direction=field.direction.map(x=>sign*x)
      const guess=left.map((x,i)=>x+radius*direction[i])
      const correction=correctForwardHugoniotPoint(left,guess,p,{minJump,maxCorrection:Math.max(0.02,radius*3)})
      if(correction.status==='converged' && distance(correction.point,left)>minJump)
        seeds.push({family,sign,point:correction.point,direction,lambda:field.lambda,
          residual:correction.residual})
    }
  }
  return {status:seeds.length?'seeded':'seed-correction-unresolved',seeds}
}

/** Match the outgoing direction of a sampled guide to exactly one local
 * characteristic branch. An ambiguous match is not silently accepted. */
export function selectCharacteristicForwardSeed(left,guide,p,options={}){
  if(!Array.isArray(guide)||guide.length<2||!Array.isArray(guide[1])||
     guide[1].length!==2||!guide[1].every(Number.isFinite))
    return {status:'invalid-guide',seed:null}
  const delta=guide[1].map((x,i)=>x-left[i]),length=Math.hypot(...delta)
  if(length<=1e-12)return {status:'degenerate-guide',seed:null}
  const result=characteristicForwardHugoniotSeeds(left,p,options)
  if(result.status!=='seeded')return {status:result.status,seed:null}
  const oriented=delta.map(x=>x/length)
  const scored=result.seeds.map(seed=>({...seed,alignment:dot(oriented,seed.direction)}))
    .sort((a,b)=>b.alignment-a.alignment)
  const best=scored[0],runnerUp=scored[1]
  const minimumAlignment=options.minimumAlignment??0.8
  const ambiguityMargin=options.ambiguityMargin??0.05
  if(!best||best.alignment<minimumAlignment)return {status:'guide-not-characteristic',seed:null}
  if(runnerUp&&best.alignment-runnerUp.alignment<ambiguityMargin)
    return {status:'ambiguous-characteristic',seed:null}
  return {status:'matched-characteristic',seed:best,alignment:best.alignment}
}

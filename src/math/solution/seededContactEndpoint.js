import {directShockDiagnostic} from './directShockDiagnostic.js'
import {forwardHugoniotGradient,forwardHugoniotIncidence} from './forwardHugoniotContinuation.js'

const valid=q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]]
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]
const norm=a=>Math.hypot(...a)

/** Complete a seed-traced forward Hugoniot arc at a refined sonic endpoint.
 * An endpoint is appended only when it satisfies RH and lies in a small,
 * forward-oriented tangent neighbourhood of the last traced vertex.
 * This is an endpoint validation, not a global branch-uniqueness proof. */
export function attachForwardSonicEndpoint(left,arc,target,p,{
  maxGap=0.05,maxTransverse=0.008,relativeTolerance=1e-8,
  minProgress=-1e-8,
}={}){
  if(!valid(left)||!valid(target)||!Array.isArray(arc)||arc.length<3||
     arc.some(q=>!valid(q))||![maxGap,maxTransverse,relativeTolerance].every(x=>Number.isFinite(x)&&x>0))
    return {status:'invalid-input',arc:null}
  const scale=1+Math.max(norm(left),norm(target))
  if(norm(sub(arc[0],left))>1e-7*scale)return {status:'unanchored-arc',arc:null}
  const shock=directShockDiagnostic(left,target,p,{relativeTolerance})
  if(shock.kind!=='jump'||!shock.rankineHugoniot)return {status:'target-off-hugoniot',arc:null}
  const last=arc.at(-1),previous=arc.at(-2),edge=sub(last,previous),gap=sub(target,last)
  const edgeNorm=norm(edge),gapNorm=norm(gap)
  if(edgeNorm<=1e-12*scale)return {status:'degenerate-tangent',arc:null}
  if(gapNorm>maxGap*scale)return {status:'target-too-far',arc:null,gap:gapNorm}
  const gradient=forwardHugoniotGradient(left,target,p)
  const incidence=Math.abs(forwardHugoniotIncidence(left,target,p))
  if(!gradient.every(Number.isFinite)||!Number.isFinite(incidence))return {status:'invalid-incidence',arc:null}
  const tangent=edge.map(x=>x/edgeNorm)
  const progress=dot(gap,tangent),transverse=Math.abs(gap[0]*tangent[1]-gap[1]*tangent[0])
  if(progress<minProgress*scale)return {status:'backward-endpoint',arc:null,progress}
  if(transverse>maxTransverse*scale)return {status:'transverse-gap',arc:null,transverse}
  // A target at a self-intersection may lie on another local branch.
  // Reject it if the endpoint's RH tangent is incompatible with the traced one.
  const gn=norm(gradient)
  if(gn<=1e-14*scale*scale)return {status:'singular-endpoint',arc:null}
  const endpointTangent=[-gradient[1]/gn,gradient[0]/gn]
  if(Math.abs(dot(endpointTangent,tangent))<0.8)return {status:'tangent-mismatch',arc:null}
  const finalArc=gapNorm<=1e-12*scale?[...arc]:[...arc,target]
  return {status:'endpoint-attached',arc:finalArc,gap:gapNorm,transverse,progress,
    relativeResidual:shock.relativeResidual,
    qualification:'RH endpoint and local tangent consistency; global branch and entropy not certified'}
}

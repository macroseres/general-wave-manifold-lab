import {directShockDiagnostic} from './directShockDiagnostic.js'
import {stateCharacteristicDirection} from '../rarefaction/stateIntegralCurves.js'

const valid=U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)
const point=U=>[U[0],U[1]]
const coords=U=>Array.isArray(U)?U:[U?.u,U?.v]
const lerp=(a,b,t)=>[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]

/** Build a self-similar *candidate*, never an entropy-certified solution. */
export function twoShockSelfSimilarCandidate(left,middle,right,p,{speedTolerance=1e-8}={}){
  if(![left,middle,right].every(valid))return {status:'missing-states',entropyCertified:false}
  const first=directShockDiagnostic(left,middle,p),second=directShockDiagnostic(middle,right,p)
  if(!first.rankineHugoniot||!second.rankineHugoniot)return {status:'rh-unverified',entropyCertified:false}
  const gap=second.speed-first.speed
  if(!(gap>speedTolerance*(1+Math.max(Math.abs(first.speed),Math.abs(second.speed)))))return {status:'unordered-speeds',entropyCertified:false}
  const speeds=[first.speed,second.speed]
  return {status:'sampled-candidate',kind:'two-shock',speeds,states:[point(left),point(middle),point(right)],entropyCertified:false}
}

/** A fan interpolates a numerically sampled integral curve by characteristic speed.
 * The interpolation is for visualization only; it is not an exact ODE solution.
 */
export function mixedSelfSimilarCandidate(left,right,candidate,branches,p,{speedTolerance=1e-7,joinTolerance=0.05}={}){
  if(!valid(left)||!valid(right)||!candidate||candidate.evidence?.status!=='mixed-ordered-lax-candidate'||candidate.fanArc?.passes!==true)
    return {status:'unverified-chain',entropyCertified:false}
  const kind=candidate.kind,fromLeft=kind==='rarefaction-shock'
  if(!fromLeft&&kind!=='shock-rarefaction')return {status:'invalid-kind',entropyCertified:false}
  const middle=candidate.refinement?.status==='refined-candidate'?candidate.refinement.middle:candidate.middle
  if(!valid(middle)||candidate.refinement?.status!=='refined-candidate')return {status:'unrefined-middle',entropyCertified:false}
  const side=fromLeft?'left':'right'
  const branch=(branches??[]).find(b=>b.side===side&&b.family===candidate.family&&b.sign===candidate.branchSign)
  const index=Math.floor(candidate.branchIndex)
  if(!branch||!Number.isInteger(index)||index<0||index+1>=branch.points.length)return {status:'missing-fan',entropyCertified:false}
  const raw=branch.points.slice(0,index+1).map(coords)
  if(!raw.every(valid))return {status:'invalid-fan',entropyCertified:false}
  const a=coords(branch.points[index]),b=coords(branch.points[index+1])
  const d=[b[0]-a[0],b[1]-a[1]],den=d[0]**2+d[1]**2
  if(!(den>1e-20))return {status:'degenerate-fan',entropyCertified:false}
  const t=Math.max(0,Math.min(1,((middle[0]-a[0])*d[0]+(middle[1]-a[1])*d[1])/den))
  if(Math.hypot(...[middle[0]-a[0]-t*d[0],middle[1]-a[1]-t*d[1]])>joinTolerance*(1+Math.sqrt(den)))return {status:'off-fan',entropyCertified:false}
  const ordered=fromLeft?[...raw,middle]:[middle,...raw.reverse()]
  const lambdas=ordered.map(U=>stateCharacteristicDirection(U,p,candidate.family)?.lambda)
  if(lambdas.some(v=>!Number.isFinite(v)))return {status:'nonhyperbolic-fan',entropyCertified:false}
  for(let i=1;i<lambdas.length;i++)if(lambdas[i]<lambdas[i-1]-speedTolerance*(1+Math.max(Math.abs(lambdas[i]),Math.abs(lambdas[i-1]))))return {status:'fan-reversal',entropyCertified:false}
  const shock=fromLeft?directShockDiagnostic(middle,right,p):directShockDiagnostic(left,middle,p)
  if(!shock.rankineHugoniot)return {status:'rh-unverified',entropyCertified:false}
  const s=shock.speed,eps=speedTolerance*(1+Math.max(Math.abs(s),...lambdas.map(Math.abs)))
  if(fromLeft?!(s>lambdas.at(-1)+eps):!(lambdas[0]>s+eps))return {status:'unordered-speeds',entropyCertified:false}
  return {status:'sampled-candidate',kind,fanStates:ordered.map(point),fanSpeeds:lambdas,shockSpeed:s,
    left:point(left),middle:point(middle),right:point(right),entropyCertified:false}
}

/** Evaluate a piecewise candidate U(x/t). Values at shocks use the right trace. */
export function evaluateSelfSimilarCandidate(candidate,xi){
  if(candidate?.status!=='sampled-candidate'||!Number.isFinite(xi))return null
  if(candidate.kind==='two-shock'){
    const [a,b]=candidate.speeds
    return point(candidate.states[xi<a?0:xi<b?1:2])
  }
  const {fanSpeeds:lambda,fanStates:states,shockSpeed:s}=candidate
  if(!Array.isArray(lambda)||lambda.length<2||lambda.length!==states?.length)return null
  if(candidate.kind==='rarefaction-shock'){
    if(xi<lambda[0])return point(candidate.left)
    if(xi>=s)return point(candidate.right)
    if(xi>=lambda.at(-1))return point(candidate.middle)
  }else if(candidate.kind==='shock-rarefaction'){
    if(xi<s)return point(candidate.left)
    if(xi<lambda[0])return point(candidate.middle)
    if(xi>=lambda.at(-1))return point(candidate.right)
  }else return null
  for(let i=1;i<lambda.length;i++)if(xi<=lambda[i]){
    const gap=lambda[i]-lambda[i-1]
    return gap>1e-12?lerp(states[i-1],states[i],Math.max(0,Math.min(1,(xi-lambda[i-1])/gap))):point(states[i])
  }
  return point(states.at(-1))
}

import {jacobian} from '../flux/quadraticFlux.js'
import {directShockDiagnostic} from './directShockDiagnostic.js'
import {forwardHugoniotGradient} from './forwardHugoniotContinuation.js'

const valid=v=>Array.isArray(v)&&v.length===2&&v.every(Number.isFinite)
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]

/** Derivative of RH shock speed along a unit tangent to the forward Hugoniot.
 * The sign depends on tangent orientation; its zeros do not. At a singular
 * incidence gradient the tangent is undefined and no classification is made.
 */
export function liuTangentialSpeed(left,right,p,{gradientTolerance=1e-11,relativeTolerance=1e-7}={}){
  if(!valid(left)||!valid(right))return {status:'invalid-input'}
  const shock=directShockDiagnostic(left,right,p,{relativeTolerance})
  if(shock.kind!=='jump'||!shock.rankineHugoniot)return {status:'off-hugoniot'}
  const g=forwardHugoniotGradient(left,right,p)
  const gn=Math.hypot(...g)
  const scale=1+Math.hypot(...left)+Math.hypot(...right)
  if(!Number.isFinite(gn)||gn<=gradientTolerance*scale*scale)return {status:'singular-tangent'}
  const tangent=[-g[1]/gn,g[0]/gn]
  const d=[right[0]-left[0],right[1]-left[1]]
  const J=jacobian(right,p)
  const velocityDerivative=[J[0][0]*tangent[0]+J[0][1]*tangent[1]-shock.speed*tangent[0],
    J[1][0]*tangent[0]+J[1][1]*tangent[1]-shock.speed*tangent[1]]
  const derivative=dot(d,velocityDerivative)/dot(d,d)
  if(!Number.isFinite(derivative))return {status:'nonfinite-derivative'}
  return {status:'regular',speed:shock.speed,derivative,tangent,gradientNorm:gn}
}

/** Locate *brackets* of stationary shock speed along a supplied ordered arc.
 * A sign change is a candidate only: it is not a certified stationary point.
 */
export function liuTangentialExtrema(left,arc,p,{zeroTolerance=1e-7,...options}={}){
  if(!valid(left)||!Array.isArray(arc)||arc.length<3||arc.some(q=>!valid(q)))
    return {status:'invalid-input',candidates:[]}
  const samples=[]
  for(let i=1;i<arc.length;i++){
    const result=liuTangentialSpeed(left,arc[i],p,options)
    if(result.status!=='regular')return {status:'inconclusive',at:i,reason:result.status,candidates:[]}
    let derivative=result.derivative
    // Orient each tangent in the direction of the sampled arc.
    const direction=[arc[i][0]-arc[i-1][0],arc[i][1]-arc[i-1][1]]
    if(dot(result.tangent,direction)<0)derivative=-derivative
    samples.push({index:i,point:arc[i],speed:result.speed,derivative})
  }
  const candidates=[]
  for(let i=0;i<samples.length;i++){
    const current=samples[i]
    if(Math.abs(current.derivative)<=zeroTolerance)candidates.push({kind:'near-zero',index:current.index,point:current.point})
    if(i>0&&samples[i-1].derivative*current.derivative<0)
      candidates.push({kind:'sign-change',indices:[samples[i-1].index,current.index],points:[samples[i-1].point,current.point]})
  }
  return {status:'sampled-tangential-diagnostic',candidates,samples,
    qualification:'stationary-speed candidates from an oriented sampled arc; not a global Liu certificate'}
}

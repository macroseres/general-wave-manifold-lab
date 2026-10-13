import {flux,jacobian} from '../flux/quadraticFlux.js'
import {directShockDiagnostic} from './directShockDiagnostic.js'

const norm=v=>Math.hypot(...v)
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0]
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]]
const finite=v=>Array.isArray(v)&&v.length===2&&v.every(Number.isFinite)

/** Scalar Rankine–Hugoniot incidence for a fixed left state.
 * H(U)=det(U-U_L,F(U)-F(U_L))=0. Its trivial zero at U_L
 * is excluded by the corrector's minimum-jump safeguard.
 */
export function forwardHugoniotIncidence(left,right,p){
  if(!finite(left)||!finite(right))return NaN
  return cross(sub(right,left),sub(flux(right,p),flux(left,p)))
}

export function forwardHugoniotGradient(left,right,p){
  const d=sub(right,left),df=sub(flux(right,p),flux(left,p)),J=jacobian(right,p)
  return [df[1]+d[0]*J[1][0]-d[1]*J[0][0],
    -df[0]+d[0]*J[1][1]-d[1]*J[0][1]]
}

/** Project a seed onto the same nearby RH branch using a normal Newton step.
 * The distance guard prevents jumping between remote Hugoniot branches.
 */
export function correctForwardHugoniotPoint(left,seed,p,{
  tolerance=1e-10,maxIterations=24,maxCorrection=0.15,minJump=1e-7,
}={}){
  if(!finite(left)||!finite(seed)||norm(sub(seed,left))<=minJump)
    return {status:'invalid-seed',point:null}
  let point=[...seed]
  const scale=1+norm(left)+norm(seed)
  for(let k=0;k<=maxIterations;k++){
    const h=forwardHugoniotIncidence(left,point,p)
    const g=forwardHugoniotGradient(left,point,p)
    const jump=norm(sub(point,left))
    if(!Number.isFinite(h)||!g.every(Number.isFinite)||jump<=minJump)
      return {status:'degenerate',point:null}
    const shock=directShockDiagnostic(left,point,p)
    if(Math.abs(h)<=tolerance*scale**3&&shock.rankineHugoniot)
      return {status:'converged',point,iterations:k,residual:shock.relativeResidual}
    const gg=g[0]**2+g[1]**2
    if(gg<=1e-26)return {status:'singular-gradient',point:null}
    const step=[h*g[0]/gg,h*g[1]/gg]
    if(norm(step)>maxCorrection*scale)return {status:'correction-too-large',point:null}
    let accepted=false
    for(let factor=1;factor>=1/128;factor/=2){
      const trial=sub(point,step.map(v=>v*factor))
      if(norm(sub(trial,seed))>maxCorrection*scale||norm(sub(trial,left))<=minJump)continue
      if(Math.abs(forwardHugoniotIncidence(left,trial,p))<Math.abs(h)){
        point=trial;accepted=true;break
      }
    }
    if(!accepted)return {status:'stalled',point:null}
  }
  return {status:'max-iterations',point:null}
}

/** Correct sampled arc vertices and adaptively insert RH-corrected midpoints.
 * The original connectivity is respected; no unobserved branch is invented.
 */
export function continueSampledForwardHugoniot(left,arc,p,{
  maxChord=0.08,maxDepth=7,relativeTolerance=1e-7,...correctorOptions
}={}){
  if(!finite(left)||!Array.isArray(arc)||arc.length<3||arc.some(q=>!finite(q)))
    return {status:'invalid-arc',arc:null}
  const scale=1+Math.max(norm(left),...arc.map(norm))
  if(norm(sub(arc[0],left))>1e-5*scale)return {status:'unanchored-arc',arc:null}
  const vertices=[left]
  for(const seed of arc.slice(1)){
    const q=correctForwardHugoniotPoint(left,seed,p,correctorOptions)
    if(q.status!=='converged')return {status:`vertex-${q.status}`,arc:null}
    vertices.push(q.point)
  }
  let added=0
  const result=[vertices[0]]
  function subdivide(a,b,depth){
    if(norm(sub(b,a))<=maxChord*scale)return true
    if(depth>=maxDepth)return false
    const midpoint=[(a[0]+b[0])/2,(a[1]+b[1])/2]
    const corrected=correctForwardHugoniotPoint(left,midpoint,p,{
      ...correctorOptions,maxCorrection:Math.min(0.15,0.5*norm(sub(b,a))/scale),
    })
    if(corrected.status!=='converged')return false
    const m=corrected.point
    if(norm(sub(m,a))>=norm(sub(b,a))||norm(sub(m,b))>=norm(sub(b,a)))return false
    if(!subdivide(a,m,depth+1))return false
    result.push(m);added++
    return subdivide(m,b,depth+1)
  }
  for(let i=1;i<vertices.length;i++){
    // The characteristic point U_L is a singular zero of the scalar incidence;
    // its first edge is not certified by a midpoint corrector.
    if(i>1&&!subdivide(vertices[i-1],vertices[i],0))
      return {status:'continuation-unresolved',arc:null}
    result.push(vertices[i])
  }
  for(const point of result.slice(1)){
    const shock=directShockDiagnostic(left,point,p,{relativeTolerance})
    if(shock.kind!=='jump'||!shock.rankineHugoniot)
      return {status:'off-hugoniot',arc:null}
  }
  return {status:'continued-sampled-arc',arc:result,inserted:added,checked:result.length-1,
    qualification:'locally corrected sampled arc; no global continuation certificate'}
}

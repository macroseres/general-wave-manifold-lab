import {correctForwardHugoniotPoint} from './forwardHugoniotContinuation.js'
import {liuTangentialSpeed,liuTangentialExtrema} from './liuTangentialSpeed.js'

const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]]
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]
const norm=a=>Math.hypot(...a)

/** Refine stationary shock-speed candidates on a locally corrected RH branch.
 * A bracket is accepted only when the tangent orientation and correction
 * remain consistent with the supplied ordered arc. This is not a global proof.
 */
export function refineLiuTangentialExtrema(left,arc,p,{
  maxIterations=35,pointTolerance=1e-7,derivativeTolerance=1e-7,
  maxCorrectionFraction=0.3,...options
}={}){
  if(!Number.isInteger(maxIterations)||maxIterations<1||
    ![pointTolerance,derivativeTolerance,maxCorrectionFraction].every(x=>Number.isFinite(x)&&x>0))
    return {status:'invalid-options',roots:[]}
  const sampled=liuTangentialExtrema(left,arc,p,options)
  if(sampled.status!=='sampled-tangential-diagnostic')return {status:'inconclusive',reason:sampled.status,roots:[]}
  const roots=[]
  let unresolved=0
  const scale=1+Math.max(norm(left),...arc.map(norm))
  const derivativeAt=(q,direction)=>{
    const result=liuTangentialSpeed(left,q,p,options)
    if(result.status!=='regular')return null
    const alignment=dot(result.tangent,direction)
    if(Math.abs(alignment)<=1e-10*norm(direction))return null
    return {point:q,derivative:result.derivative*Math.sign(alignment),speed:result.speed}
  }
  for(const candidate of sampled.candidates){
    if(candidate.kind==='near-zero'){
      const q=sampled.samples.find(s=>s.index===candidate.index)
      if(q)roots.push({status:'near-zero-sample',point:q.point,derivative:q.derivative,speed:q.speed})
      continue
    }
    if(candidate.kind!=='sign-change')continue
    let [a,b]=candidate.points
    const direction=sub(b,a)
    let da=derivativeAt(a,direction),db=derivativeAt(b,direction)
    if(!da||!db||da.derivative*db.derivative>=0){unresolved++;continue}
    let root=null
    for(let i=0;i<maxIterations;i++){
      const midpoint=[(a[0]+b[0])/2,(a[1]+b[1])/2]
      const corrected=correctForwardHugoniotPoint(left,midpoint,p,{
        maxCorrection:Math.min(0.15,maxCorrectionFraction*norm(sub(b,a))/scale),
        ...options,
      })
      if(corrected.status!=='converged'){break}
      const q=corrected.point
      if(norm(sub(q,midpoint))>maxCorrectionFraction*norm(sub(b,a)))break
      const progress=dot(sub(q,a),sub(b,a))/Math.max(1e-30,dot(sub(b,a),sub(b,a)))
      if(progress<=0.05||progress>=0.95)break
      const dm=derivativeAt(q,direction)
      if(!dm)break
      if(Math.abs(dm.derivative)<=derivativeTolerance||norm(sub(b,a))<=pointTolerance*scale){
        root={status:'refined-candidate',...dm,iterations:i+1,bracketWidth:norm(sub(b,a))};break
      }
      if(da.derivative*dm.derivative<0){b=q;db=dm}
      else if(dm.derivative*db.derivative<0){a=q;da=dm}
      else break
    }
    if(root)roots.push(root)
    else unresolved++
  }
  return {status:unresolved?'partially-refined':'refined-candidates',roots,unresolved,
    qualification:'RH-corrected local stationary-speed candidates; no continuous or global Liu certificate'}
}

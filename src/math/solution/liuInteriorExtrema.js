import {liuTangentialExtrema} from './liuTangentialSpeed.js'
import {refineLiuTangentialExtrema} from './refineLiuTangentialExtrema.js'
import {liuStationaryOrdering} from './liuStationaryOrdering.js'
import {directShockDiagnostic} from './directShockDiagnostic.js'
import {forwardHugoniotIncidence,forwardHugoniotGradient} from './forwardHugoniotContinuation.js'

const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])
const finite=q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)

/** Insert RH-corrected interior samples and test the forward Liu inequality.
 * This is a refinement of a supplied oriented arc, not a certificate of its
 * topology, its unsampled extrema, or global Liu admissibility. */
export function refinedLiuInterior(fixed,arc,p,{
  depth=3,relativeTolerance=1e-7,speedTolerance=1e-7,
  correctionTolerance=1e-9,maxCorrectionFraction=0.3,
}={}){
  if(!finite(fixed)||!Array.isArray(arc)||arc.length<3||arc.some(q=>!finite(q))||
    !Number.isInteger(depth)||depth<0||depth>10||
    ![relativeTolerance,speedTolerance,correctionTolerance,maxCorrectionFraction].every(x=>Number.isFinite(x)&&x>0))
    return {status:'invalid-input',passes:false}
  const scale=1+Math.max(Math.hypot(...fixed),...arc.map(q=>Math.hypot(...q)))
  if(distance(arc[0],fixed)>1e-7*scale)return {status:'unanchored-arc',passes:false}
  const target=directShockDiagnostic(fixed,arc.at(-1),p,{relativeTolerance})
  if(!target.rankineHugoniot||target.kind!=='jump')return {status:'invalid-target',passes:false}
  const correctedMidpoint=(a,b)=>{
    const midpoint=[(a[0]+b[0])/2,(a[1]+b[1])/2]
    let q=[...midpoint]
    for(let i=0;i<20;i++){
      const residual=forwardHugoniotIncidence(fixed,q,p)
      const gradient=forwardHugoniotGradient(fixed,q,p)
      const gg=gradient[0]**2+gradient[1]**2
      if(!Number.isFinite(residual)||!Number.isFinite(gg)||gg<1e-24)return null
      if(Math.abs(residual)<=correctionTolerance*scale**3)break
      q=[q[0]-residual*gradient[0]/gg,q[1]-residual*gradient[1]/gg]
      if(distance(q,midpoint)>maxCorrectionFraction*distance(a,b))return null
    }
    if(distance(q,midpoint)>maxCorrectionFraction*distance(a,b))return null
    const shock=directShockDiagnostic(fixed,q,p,{relativeTolerance})
    if(!shock.rankineHugoniot||shock.kind!=='jump')return null
    // Reject a projection that jumps beyond the original segment.
    const ab=[b[0]-a[0],b[1]-a[1]]
    const progress=((q[0]-a[0])*ab[0]+(q[1]-a[1])*ab[1])/(ab[0]**2+ab[1]**2)
    return progress>0.05&&progress<0.95?q:null
  }
  let refined=[arc[0]],inserted=0
  for(let i=1;i<arc.length;i++){
    const a=arc[i-1],b=arc[i]
    const subdivide=(x,y,level)=>{
      if(level===0){refined.push(y);return true}
      const midpoint=correctedMidpoint(x,y)
      if(!midpoint)return false
      inserted++
      return subdivide(x,midpoint,level-1)&&subdivide(midpoint,y,level-1)
    }
    if(!subdivide(a,b,depth))return {status:'interior-refinement-inconclusive',passes:false,inserted}
  }
  const samples=[]
  for(let i=1;i<refined.length-1;i++){
    if(distance(refined[i],fixed)<1e-10*scale)continue
    const shock=directShockDiagnostic(fixed,refined[i],p,{relativeTolerance})
    if(!shock.rankineHugoniot||shock.kind!=='jump')return {status:'off-hugoniot',passes:false,inserted}
    samples.push({index:i,speed:shock.speed,point:refined[i]})
  }
  if(!samples.length)return {status:'insufficient-samples',passes:false,inserted}
  const epsilon=speedTolerance*(1+Math.max(Math.abs(target.speed),...samples.map(q=>Math.abs(q.speed))))
  const violations=samples.filter(q=>target.speed>q.speed+epsilon)
  // Local extrema on the refined mesh: candidates only, not continuous extrema.
  const extrema=samples.filter((q,i)=>i>0&&i<samples.length-1&&
    (q.speed-samples[i-1].speed)*(samples[i+1].speed-q.speed)<=0)
  const tangential=liuTangentialExtrema(fixed,refined,p,{relativeTolerance})
  const tangentialRefinement=refineLiuTangentialExtrema(fixed,refined,p,{relativeTolerance})
  const stationaryOrdering=liuStationaryOrdering(fixed,refined.at(-1),tangentialRefinement,p,{relativeTolerance,speedTolerance})
  return {tangential,tangentialRefinement,stationaryOrdering,status:violations.length?'refined-liu-violation':'refined-liu-compatible',
    passes:violations.length===0,inserted,checked:samples.length,
    targetSpeed:target.speed,minimumIntermediateSpeed:Math.min(...samples.map(q=>q.speed)),
    violations,extrema,qualification:'refined RH-corrected samples only; not a continuous or global Liu certificate'}
}

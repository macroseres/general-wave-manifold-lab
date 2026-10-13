import {traceStateRarefaction} from '../rarefaction/stateIntegralCurves.js'
import {mixedCharacteristicChordError} from './riemannMixedTransversality.js'

const valid=U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])

/** Refinement experiment on the same characteristic branch, anchored at a fixed
 * reference state. Chords are selected by closest projection to the reference
 * U_M; no new Hugoniot intersection is inferred or entropy certified.
 */
export function mixedAngularConvergence(anchor,middle,p,{family,sign,step=0.04,
  levels=3,maxLength=12,matchTolerance=0.08}={}){
  const unavailable=status=>({status,rows:[],entropyCertified:false})
  if(!valid(anchor)||!valid(middle)||!p||!['slow','fast'].includes(family)||
    ![-1,1].includes(sign)||!(step>0)||!Number.isInteger(levels)||levels<2||levels>6||
    !(maxLength>0)||!(matchTolerance>0))return unavailable('invalid-input')
  const rows=[]
  for(let level=0;level<levels;level++){
    const h=step/2**level
    const trace=traceStateRarefaction(anchor,p,family,sign,{step:h,maxLength,maxSteps:Math.max(1000,Math.ceil(maxLength/h)*3)})
    let best=null
    for(let i=1;i<trace.points.length;i++){
      const a=trace.points[i-1],b=trace.points[i]
      const chord=[b[0]-a[0],b[1]-a[1]],den=chord[0]**2+chord[1]**2
      if(!(den>1e-24))continue
      const t=Math.max(0,Math.min(1,((middle[0]-a[0])*chord[0]+(middle[1]-a[1])*chord[1])/den))
      const closest=[a[0]+t*chord[0],a[1]+t*chord[1]]
      const error=distance(middle,closest)
      if(!best||error<best.distance)best={distance:error,chord,closest,segmentIndex:i-1}
    }
    if(!best||best.distance>matchTolerance*(1+Math.hypot(...middle))){
      rows.push({step:h,status:'branch-not-localized',angleDegrees:null,traceStop:trace.stop})
      continue
    }
    const angular=mixedCharacteristicChordError(best.closest,best.chord,family,p)
    rows.push({step:h,status:angular.status,angleDegrees:angular.angleDegrees,
      distanceToMiddle:best.distance,segmentIndex:best.segmentIndex,traceStop:trace.stop})
  }
  const angles=rows.map(r=>r.angleDegrees)
  if(angles.some(a=>!Number.isFinite(a)))return {status:'inconclusive',rows,entropyCertified:false}
  const first=angles[0],last=angles.at(-1)
  return {status:last<first-1e-8?'decreasing-observed':last>first+1e-8?'increasing-observed':'unchanged-observed',
    rows,firstAngle:first,lastAngle:last,entropyCertified:false}
}

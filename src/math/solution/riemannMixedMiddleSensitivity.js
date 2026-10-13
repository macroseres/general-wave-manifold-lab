import {traceStateRarefaction} from '../rarefaction/stateIntegralCurves.js'
import {flux} from '../flux/quadraticFlux.js'
import {segmentIncidenceRoots} from './riemannMixedRootSearch.js'
import {mixedCharacteristicTransversality,mixedCharacteristicChordError} from './riemannMixedTransversality.js'
import {mixedAngularConvergence} from './riemannMixedAngularConvergence.js'
import {mixedMiddleConvergence} from './riemannMixedMiddleConvergence.js'
import {middleConvergenceOrder} from './riemannMiddleConvergenceOrder.js'

const coefficients=['a20','a11','a02','a10','a01','b20','b11','b02','b10','b01']
const valid=U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])
const det=(a,b)=>a[0]*b[1]-a[1]*b[0]
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]]
const incidence=(a,b,p)=>det(sub(b,a),sub(flux(b,p),flux(a,p)))

/** Follow the same oriented characteristic branch after a coefficient perturbation.
 * Roots are bracketed on traced segments; a nearby continuation is required.
 * This is a finite-difference reconstruction of a sampled branch, not an entropy test.
 */
export function mixedMiddleReconstructionSensitivity(left,middle,right,p,{
  kind,family,sign,relativeStep=2e-4,maxLength=12,step=0.02,
  matchTolerance=0.08,rootTolerance=1e-9,
}={}){
  const unavailable=status=>({status,rows:[],entropyCertified:false})
  if(![left,middle,right].every(valid)||!p||!['rarefaction-shock','shock-rarefaction'].includes(kind)||
    !['slow','fast'].includes(family)||![-1,1].includes(sign)||!(relativeStep>0))return unavailable('invalid-input')
  const anchor=kind==='rarefaction-shock'?left:right
  const fixed=kind==='rarefaction-shock'?right:left
  const rootFor=q=>{
    const trace=traceStateRarefaction(anchor,q,family,sign,{maxLength,step,maxSteps:1000})
    const pts=trace.points
    const roots=[]
    for(let i=1;i<pts.length;i++){
      const a=pts[i-1],b=pts[i]
      const candidates=segmentIncidenceRoots(a,b,point=>incidence(fixed,point,q),{rootTolerance})
      for(const candidate of candidates){
        const root=candidate.point
        const residual=Math.abs(incidence(fixed,root,q))
        if(residual<=rootTolerance*(1+Math.hypot(...root))**3&&
          !roots.some(r=>distance(r.point,root)<1e-5))roots.push({point:root,tangent:sub(b,a)})
      }
    }
    const matches=roots.filter(root=>distance(root.point,middle)<=matchTolerance*(1+Math.hypot(...middle)))
    if(matches.length!==1)return {status:matches.length?'ambiguous-nearby-roots':'no-nearby-root',rootCount:roots.length}
    return {status:'matched',point:matches[0].point,tangent:matches[0].tangent,rootCount:roots.length}
  }
  const baseline=rootFor(p)
  if(baseline.status!=='matched')return {...unavailable(`baseline-${baseline.status}`),baseline}
  if(distance(baseline.point,middle)>matchTolerance*(1+Math.hypot(...middle)))return unavailable('baseline-mismatch')
  const transversality=mixedCharacteristicTransversality(fixed,baseline.point,family,p)
  const chordError=mixedCharacteristicChordError(baseline.point,baseline.tangent,family,p)
  const angularConvergence=mixedAngularConvergence(anchor,baseline.point,p,{family,sign,step,maxLength})
  const middleConvergence=mixedMiddleConvergence(left,baseline.point,right,p,{kind,family,sign,step:step*4,maxLength,matchTolerance,rootTolerance})
  const rows=coefficients.map(coefficient=>{
    const h=relativeStep*(1+Math.abs(p[coefficient]??0))
    const negative=rootFor({...p,[coefficient]:(p[coefficient]??0)-h})
    const positive=rootFor({...p,[coefficient]:(p[coefficient]??0)+h})
    const derivative=negative.status==='matched'&&positive.status==='matched'?
      [(positive.point[0]-negative.point[0])/(2*h),(positive.point[1]-negative.point[1])/(2*h)]:null
    return {coefficient,step:h,negative,positive,derivative}
  })
  return {status:rows.every(r=>r.derivative)?'sampled-reconstruction':'partial-reconstruction',
    rows,baseline,transversality,chordError,angularConvergence,middleConvergence,middleConvergenceOrder:middleConvergenceOrder(middleConvergence),kind,family,sign,entropyCertified:false}
}

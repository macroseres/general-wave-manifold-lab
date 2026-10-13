import {traceStateRarefaction} from '../rarefaction/stateIntegralCurves.js'
import {flux} from '../flux/quadraticFlux.js'
import {segmentIncidenceRoots} from './riemannMixedRootSearch.js'

const valid=U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])
const incidence=(a,b,p)=>{
  const d=[b[0]-a[0],b[1]-a[1]]
  const f=flux(b,p),g=flux(a,p)
  return d[0]*(f[1]-g[1])-d[1]*(f[0]-g[0])
}

/** Convergence experiment for the *reconstructed* rarefaction/Hugoniot intersection.
 * Each level reintegrates the rarefaction and resolves RH on every sampled chord.
 * The closest unique root to the supplied reference is tracked; no entropy claim.
 */
export function mixedMiddleConvergence(left,middle,right,p,{
  kind,family,sign,step=0.08,levels=4,maxLength=12,
  matchTolerance=0.08,rootTolerance=1e-9,ambiguityTolerance=1e-5,
}={}){
  const unavailable=status=>({status,rows:[],entropyCertified:false})
  if(![left,middle,right].every(valid)||!p||!['rarefaction-shock','shock-rarefaction'].includes(kind)||
    !['slow','fast'].includes(family)||![-1,1].includes(sign)||!(step>0)||
    !Number.isInteger(levels)||levels<2||levels>6||!(maxLength>0)||!(matchTolerance>0)||!(rootTolerance>0))
    return unavailable('invalid-input')
  const anchor=kind==='rarefaction-shock'?left:right
  const fixed=kind==='rarefaction-shock'?right:left
  const rows=[]
  for(let level=0;level<levels;level++){
    const h=step/2**level
    const trace=traceStateRarefaction(anchor,p,family,sign,{
      step:h,maxLength,maxSteps:Math.max(1000,Math.ceil(maxLength/h)*3),
    })
    const roots=[]
    for(let i=1;i<trace.points.length;i++){
      const a=trace.points[i-1],b=trace.points[i]
      for(const candidate of segmentIncidenceRoots(a,b,U=>incidence(fixed,U,p),{rootTolerance})){
        const U=candidate.point
        const residual=Math.abs(incidence(fixed,U,p))
        if(residual>rootTolerance*(1+Math.hypot(...U))**3)continue
        if(distance(U,fixed)<1e-7)continue // trivial zero jump
        if(!roots.some(r=>distance(r.point,U)<ambiguityTolerance))
          roots.push({point:U,residual,segmentIndex:i-1})
      }
    }
    const nearby=roots.filter(r=>distance(r.point,middle)<=matchTolerance*(1+Math.hypot(...middle)))
    if(nearby.length!==1){
      rows.push({step:h,status:nearby.length?'ambiguous-roots':'root-not-localized',
        rootCount:roots.length,nearbyCount:nearby.length,traceStop:trace.stop})
      continue
    }
    rows.push({step:h,status:'matched',middle:nearby[0].point,
      distanceToReference:distance(nearby[0].point,middle),
      residual:nearby[0].residual,segmentIndex:nearby[0].segmentIndex,
      rootCount:roots.length,traceStop:trace.stop})
  }
  if(rows.some(r=>r.status!=='matched'))return {status:'inconclusive',rows,entropyCertified:false}
  const successiveDistances=rows.slice(1).map((r,i)=>distance(r.middle,rows[i].middle))
  const first=successiveDistances[0],last=successiveDistances.at(-1)
  return {status:last<first-1e-10?'decreasing-observed':last>first+1e-10?'increasing-observed':'unchanged-observed',
    rows,successiveDistances,entropyCertified:false}
}

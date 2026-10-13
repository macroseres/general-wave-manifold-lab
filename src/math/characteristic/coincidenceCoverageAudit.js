import { sampleDiscriminantRegions } from './discriminantRegions.js'

/** Window-local reverse check: sampled D=0 contour versus projected E.
 * Distances are geometric sampling diagnostics, not proof of a global lift.
 * Isolated zeros and components missed by contour sampling remain undetected.
 */
export function auditCoincidenceCoverage(loci, p, window, {steps=64, toleranceCells=2}={}) {
  const contour = sampleDiscriminantRegions(p, window, {steps}).segments
  const e = loci.find(item => item.id === 'E')
  const cell = Math.hypot((window.uMax-window.uMin)/steps,(window.vMax-window.vMin)/steps)
  const tolerance = toleranceCells * cell
  const distanceToSegment = (q,a,b) => {
    const dx=b.u-a.u,dy=b.v-a.v,den=dx*dx+dy*dy
    const t=den===0?0:Math.max(0,Math.min(1,((q.u-a.u)*dx+(q.v-a.v)*dy)/den))
    return Math.hypot(q.u-a.u-t*dx,q.v-a.v-t*dy)
  }
  const result={}
  for (const side of ['minus','plus']) {
    const paths=e?.projected?.[side]??[]
    const projectedSegments=[]
    for(const path of paths) for(let i=1;i<path.length;i++){
      const a=path[i-1],b=path[i]
      if([a?.u,a?.v,b?.u,b?.v].every(Number.isFinite)) projectedSegments.push([a,b])
    }
    let covered=0,uncovered=0,maxNearestDistance=0
    for(const [a,b] of contour){
      const q={u:(a.u+b.u)/2,v:(a.v+b.v)/2}
      const nearest=projectedSegments.reduce((best,[x,y])=>Math.min(best,distanceToSegment(q,x,y)),Infinity)
      if(nearest<=tolerance) covered++
      else uncovered++
      if(Number.isFinite(nearest))maxNearestDistance=Math.max(maxNearestDistance,nearest)
    }
    result[side]={contourSegments:contour.length,projectedSegments:projectedSegments.length,covered,uncovered,tolerance,maxNearestDistance,
      status:contour.length===0?'no-contour':projectedSegments.length===0?'no-lift':uncovered?'partial':'sample-covered'}
  }
  return result
}

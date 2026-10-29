import {rarefactionField} from '../../math/rarefaction/field.js'
import {zFromZc} from '../../math/charts/zChart.js'
import {curvePoints3D} from '../../rendering/curvePoints.js'

/** Phase-plane integrations store only tau and zc; Y is identically zero. */
export function rarefactionPhasePoints(points,yOffset=0){
  return curvePoints3D(points.map(q=>({...q,Y:0})),'tauYzc',{yOffset})
}

/** Orient display arrows by the finite-chart field, not stored integration order.
 * This handles backward tracing and the sign-changing reciprocal time factor.
 */
export function rarefactionPhaseArrow(points,index,p){
  if(points.length<4)return null
  const i=Math.max(1,Math.min(points.length-2,index)),point=points[i]
  if(![point?.tau,point?.zc].every(Number.isFinite)||Math.abs(point.zc)>=1)return null
  const field=rarefactionField(point.tau,zFromZc(point.zc),p)
  const length=Math.hypot(field.tauDot,field.zcDot)
  if(field.kind!=='regular'||!Number.isFinite(length)||length<=1e-12)return null
  return {point,direction:[field.tauDot/length,0,field.zcDot/length]}
}

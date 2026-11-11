import {waveState} from '../../math/manifold/waveState.js'
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

export function waveArcArrow(points, lowAtStart, axisScale) {
  const positions=points.map(q=>[q.tau,q.Y??0,q.zc])
  const scales=[axisScale.tau,axisScale.Y,axisScale.zc]
  const segments=positions.slice(1).map((end,i)=>{
    const direction=end.map((value,j)=>value-positions[i][j])
    return {direction,length:Math.hypot(...direction.map((value,j)=>value*scales[j]))}
  })
  const length=segments.reduce((sum,segment)=>sum+segment.length,0)
  if (!(length>0)) return null
  let remaining=length*(lowAtStart ? 0.15 : 0.85)
  for(const [i,segment] of segments.entries()){
    if(segment.length>0&&remaining<=segment.length){
      return {index:i,directionOverride:segment.direction,
        positionOverride:positions[i].map((value,j)=>value+segment.direction[j]*remaining/segment.length),
        size:Math.min(.8,length*2)}
    }
    remaining-=segment.length
  }
  return null
}

export function rarefactionEndpointSpeed(q,p){ return waveState(q.tau,0,zFromZc(q.zc),p).s }

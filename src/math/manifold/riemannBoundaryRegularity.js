import {riemannCharacteristicIntersections} from '../characteristic/riemannLifts.js'
import {desingularizedRegularity} from './desingularizedRegularity.js'
import {characteristicFibreTransversality} from './characteristicTransversality.js'

/** Evaluate the desingularized RH level set at characteristic boundary points.
 * These are algebraic lifts, not certified transverse intersections of sampled fibres.
 */
export function riemannBoundaryRegularity(left,right,p,tolerance=1e-9){
  const classified=riemannCharacteristicIntersections(left,right,p)
  return Object.fromEntries(['forward','backward'].map(role=>{
    const item=classified[role]
    const directions=item.directions.map(d=>{
      const [x,y]=d.direction
      const chart=Math.abs(x)>=Math.abs(y)?'finite':'reciprocal'
      const coordinate=chart==='finite'?y/x:x/y
      const result=desingularizedRegularity(item.fixedState,0,coordinate,d.speed,p,chart,tolerance)
      const transversality=characteristicFibreTransversality(item.fixedState,coordinate,d.speed,p,role,chart,tolerance)
      return {...d,boundary:{transversality,chart,coordinate,residual:Math.hypot(...result.residual),onManifold:result.onManifold,rank:result.rank,regularLevelSet:result.regularLevelSet,forwardFibreDimension:result.forwardFibreDimension,backwardFibreDimension:result.backwardFibreDimension}}
    })
    return [role,{...item,directions}]
  }))
}

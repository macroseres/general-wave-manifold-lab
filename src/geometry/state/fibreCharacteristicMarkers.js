import {stateFibreCharacteristicIntersections} from './fibreGeometry.js'

/** Algebraic intersections with Y=0, never nearest sampled curve vertices.
 * Reciprocal-chart points without finite display coordinates remain omitted.
 */
export function fibreCharacteristicMarkers(U,p){
  return stateFibreCharacteristicIntersections(U,p).filter(q=>q.shared&&
    [q.tau,q.zc].every(Number.isFinite)&&q.chart==='z').map(q=>({
    ...q,Y:0,position:[q.tau,0,q.zc],
  }))
}

/** Classical endpoint roles: slow forward at U_L, fast backward at U_R. */
export function selectedHugoniotCharacteristicMarkers(states,p){
  return {forward:fibreCharacteristicMarkers(states?.left,p).filter(q=>q.branch==='slow'),
    backward:fibreCharacteristicMarkers(states?.right,p).filter(q=>q.branch==='fast')}
}

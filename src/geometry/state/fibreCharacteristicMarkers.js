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

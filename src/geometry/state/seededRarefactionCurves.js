import {seededCompositeKs} from './seededCompositeKs.js'
import {increasingInflectionArc} from '../../math/rarefaction/increasingInflectionArc.js'
import {selectedHugoniotCharacteristicMarkers} from './fibreCharacteristicMarkers.js'
import {rarefactionOrbitThrough} from '../../math/rarefaction/orbits.js'

export function seededRarefactionCurves(states,p,tauMin,tauMax){
  const selected=selectedHugoniotCharacteristicMarkers(states,p)
  return [['slow',selected.forward[0]],['fast',selected.backward[0]]].flatMap(([family,point])=>{
    if(!point)return []
    const seed={tau:point.tau,zc:point.zc}
    if(family==='slow'){
      const arc=increasingInflectionArc(seed,p,tauMin,tauMax),points=rarefactionOrbitThrough(seed,p,tauMin,tauMax)
      const composite=seededCompositeKs(arc,p)
      return [...(arc.points.length>1?[{family,seed,...arc}]:[]),...(composite?.points.length>1?[composite]:[]),...(points.length>1?[{family,kind:'full',seed,points}]:[])]
    }
    const points=rarefactionOrbitThrough(seed,p,tauMin,tauMax)
    return points.length>1?[{family,seed,points}]:[]
  })
}

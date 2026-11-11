import {seededNonlocalShock} from './seededNonlocalShock.js'
import {seededCompositeKs} from './seededCompositeKs.js'
import {increasingInflectionArc} from '../../math/rarefaction/increasingInflectionArc.js'
import {selectedHugoniotCharacteristicMarkers} from './fibreCharacteristicMarkers.js'
import {rarefactionOrbitThrough} from '../../math/rarefaction/orbits.js'
import {NUMERICAL_POLICY} from '../../math/numerics/policy.js'

export function seededRarefactionCurves(states,p,tauMin,tauMax,{clipTau=false}={}){
  // Surface sampling bounds do not truncate the mathematical wave construction.
  const min=clipTau?tauMin:-Infinity,max=clipTau?tauMax:Infinity
  const selected=selectedHugoniotCharacteristicMarkers(states,p)
  return [['slow',selected.forward[0]],['fast',selected.backward[0]]].flatMap(([family,point])=>{
    if(!point)return []
    const seed={tau:point.tau,zc:point.zc}
    if(family==='slow'){
      const {orbitStep,orbitMaxSteps}=NUMERICAL_POLICY.rarefaction
      const arc=increasingInflectionArc(seed,p,min,max,{step:orbitStep/4,maxSteps:orbitMaxSteps*4})
      const points=rarefactionOrbitThrough(seed,p,min,max)
      const composite=seededCompositeKs(arc,p)
      const nonlocal=seededNonlocalShock(arc,composite,p,{tauMin:min,tauMax:max})
      return [...(arc.points.length>1?[{family,seed,...arc}]:[]),...(composite?.points.length>1?[composite]:[]),...(nonlocal?[nonlocal]:[]),...(points.length>1?[{family,kind:'full',seed,points}]:[])]
    }
    const points=rarefactionOrbitThrough(seed,p,min,max)
    return points.length>1?[{family,seed,points}]:[]
  })
}

import {coefficientKeys} from './affineClassification.js'
import {classifyFluxConic} from './conicClassification.js'
import {classifyScalarStratum,quadraticAtlasData} from './scalarStratification.js'

// Independent layers: no wave-class label is inferred from these invariants.
export function parameterClassification(p){
  if(!p||!coefficientKeys.every(k=>typeof p[k]==='number'&&Number.isFinite(p[k])))
    return {status:'inconclusive',reason:'Forneça dez coeficientes finitos.'}
  try{
    const scalar=classifyScalarStratum(p),quadratic=quadraticAtlasData(p),conic=classifyFluxConic(p)
    const conicResolved=[conic.determinant,conic.quadraticDiscriminant,...conic.eigenvalues].every(Number.isFinite)
    return {status:'classified',
      spectral:{status:conicResolved?'numerical':'inconclusive',type:conicResolved?conic.type:null,
        tolerance:1e-9},
      scalar:{evidence:scalar.evidence,rank:scalar.rank,augmentedRank:scalar.augmentedRank,
        homogenizable:scalar.homogenizable,locus:scalar.scalarLocus},
      directions:{evidence:scalar.evidence,rootType:quadratic.rootType,
        cubic:quadratic.cubic,discriminant:quadratic.discriminant},
      scope:'algebraic-and-spectral-layers; not global waves or entropy'}
  }catch{
    return {status:'inconclusive',reason:'Não foi possível resolver a classificação dos coeficientes fornecidos.'}
  }
}

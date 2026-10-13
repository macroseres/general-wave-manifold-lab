import {desingularizedRegularity} from './desingularizedRegularity.js'
import {numericalMatrixRank} from './rankRegularity.js'

/** Fibre intersection with the characteristic boundary A=0 in a projective chart.
 * Classifies only smooth, one-dimensional fixed-state fibres of G=0.
 */
export function characteristicFibreTransversality(state,d,s,p,role='forward',chart='finite',tolerance=1e-9){
  if(!['forward','backward'].includes(role))throw new Error('Papel de Hugoniot inválido')
  const info=desingularizedRegularity(state,0,d,s,p,chart,tolerance)
  const r=chart==='finite'?[1,d]:[d,1]
  const sign=role==='forward'?-1:1
  const projection=[[1,0,sign*r[0]/2,0,0],[0,1,sign*r[1]/2,0,0]]
  const constraints=[...info.differential,...projection]
  const fibreRank=numericalMatrixRank(constraints,tolerance)
  const boundaryRank=numericalMatrixRank([...constraints,[0,0,1,0,0]],tolerance)
  const regularFibre=info.regularLevelSet&&fibreRank===4
  const classification=!regularFibre?'undetermined':boundaryRank===5?'transverse':'tangent'
  return {classification,regularFibre,fibreRank,boundaryRank,chart,role,
    residual:Math.hypot(...info.residual),
    note:classification==='tangent'?'Contato linear da fibra regular com A=0; a ordem de contato exige análise de ordem superior.':
      classification==='transverse'?'A fibra regular cruza A=0 em primeira ordem.':'A classificação exige uma fibra regular de dimensão um.'}
}

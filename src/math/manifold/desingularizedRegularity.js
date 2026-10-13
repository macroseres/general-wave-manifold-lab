import {jacobian} from '../flux/quadraticFlux.js'
import {numericalMatrixRank} from './rankRegularity.js'

/** Desingularized nontrivial Rankine–Hugoniot equation mathcal G=(DF(ubar)-sI)r=0.
 * Coordinates (ubar_u,ubar_v,A,d,s), where U±=ubar±A*r/2.
 * finite chart: r=(1,Z), d=Z, A=X; reciprocal chart: r=(z,1), d=z, A=Y.
 * In overlap z=1/Z and Y=X*Z. These are the same physical jumps.
 * A=0 is the characteristic boundary of the nontrivial branch, not the
 * entire trivial component of the undivided RH equation F=A*G.
 */
export function desingularizedRegularity(ubar,amplitude,d,s,p,chart='finite',tolerance=1e-10){
  if(!['finite','reciprocal'].includes(chart))throw new Error('Carta desconhecida')
  if(![...ubar,amplitude,d,s].every(Number.isFinite))throw new Error('Coordenadas não finitas')
  const r=chart==='finite'?[1,d]:[d,1]
  const dr=chart==='finite'?[0,1]:[1,0]
  const J=jacobian(ubar,p)
  const M=[[J[0][0]-s,J[0][1]],[J[1][0],J[1][1]-s]]
  const hessians=[[[2*p.a20,p.a11],[p.a11,2*p.a02]],[[2*p.b20,p.b11],[p.b11,2*p.b02]]]
  const residual=M.map(row=>row[0]*r[0]+row[1]*r[1])
  const differential=M.map((row,i)=>[
    hessians[i][0][0]*r[0]+hessians[i][0][1]*r[1],
    hessians[i][1][0]*r[0]+hessians[i][1][1]*r[1],
    0,
    row[0]*dr[0]+row[1]*dr[1],
    -r[i]
  ])
  const projection=sign=>[
    [1,0,sign*r[0]/2,sign*amplitude*dr[0]/2,0],
    [0,1,sign*r[1]/2,sign*amplitude*dr[1]/2,0]
  ]
  const rank=numericalMatrixRank(differential,tolerance)
  const minusRank=numericalMatrixRank([...differential,...projection(-1)],tolerance)
  const plusRank=numericalMatrixRank([...differential,...projection(1)],tolerance)
  const onManifold=Math.hypot(...residual)<=tolerance*Math.max(1,...M.flat().map(Math.abs))
  return {chart,coordinates:{ubar:[...ubar],amplitude,d,s},residual,differential,rank,
    onManifold,regularLevelSet:onManifold&&rank===2,
    forwardAugmentedRank:minusRank,backwardAugmentedRank:plusRank,
    forwardFibreDimension:onManifold&&rank===2?5-minusRank:null,
    backwardFibreDimension:onManifold&&rank===2?5-plusRank:null,
    characteristicBoundary:amplitude===0,
    note:'A regularidade só é certificada sobre G=0. Postos aumentados não classificam, isoladamente, tangências com a característica.'}
}

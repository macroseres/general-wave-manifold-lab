import {jacobian} from '../flux/quadraticFlux.js'

/** Rank of a real matrix by scaled partial-pivot elimination. */
export function numericalMatrixRank(matrix, tolerance=1e-10) {
  if(!matrix.length)return 0
  const A=matrix.map(row=>[...row]);const m=A.length,n=A[0].length
  if(!A.every(row=>row.length===n&&row.every(Number.isFinite)))throw new Error('Matriz inválida')
  const scale=Math.max(1,...A.flat().map(Math.abs));let rank=0
  for(let col=0;col<n&&rank<m;col++){
    let pivot=rank
    for(let i=rank+1;i<m;i++)if(Math.abs(A[i][col])>Math.abs(A[pivot][col]))pivot=i
    if(Math.abs(A[pivot][col])<=tolerance*scale)continue
    ;[A[rank],A[pivot]]=[A[pivot],A[rank]]
    const value=A[rank][col]
    for(let j=col;j<n;j++)A[rank][j]/=value
    for(let i=rank+1;i<m;i++){
      const factor=A[i][col]
      for(let j=col;j<n;j++)A[i][j]-=factor*A[rank][j]
    }
    rank++
  }
  return rank
}

/** Full RH equations in (ubar_u,ubar_v,X,Z,s), with jump X(1,Z).
 * For a quadratic flux the symmetric difference is exactly X DF(ubar)(1,Z).
 * This ambient representation contains the trivial X=0 component; rank
 * defects there do not automatically imply singularity of the nontrivial
 * wave manifold's closure or of its desingularized chart.
 */
export function rankineHugoniotRegularity(ubar,X,Z,s,p,tolerance=1e-10){
  const J=jacobian(ubar,p),r=[1,Z]
  const A=[J[0][0]-s,J[0][1]],B=[J[1][0],J[1][1]-s]
  const q=[A[0]+A[1]*Z,B[0]+B[1]*Z]
  const hessians=[[[2*p.a20,p.a11],[p.a11,2*p.a02]],[[2*p.b20,p.b11],[p.b11,2*p.b02]]]
  const D=q.map((qi,i)=>[
    X*(hessians[i][0][0]+Z*hessians[i][0][1]),
    X*(hessians[i][1][0]+Z*hessians[i][1][1]),
    qi,X*(J[i][1]-(i===1?s:0)),-X*r[i]
  ])
  const residual=q.map(v=>X*v)
  const rank=numericalMatrixRank(D,tolerance)
  // Fixed left/right states U_± = ubar ± X(1,Z)/2.
  const projection=(sign)=>[
    [1,0,sign/2,0,0],
    [0,1,sign*Z/2,sign*X/2,0]
  ]
  const minusRank=numericalMatrixRank([...D,...projection(-1)],tolerance)
  const plusRank=numericalMatrixRank([...D,...projection(1)],tolerance)
  return {residual,jacobian:D,rank,regularLevelSet:rank===2,
    forwardAugmentedRank:minusRank,backwardAugmentedRank:plusRank,
    forwardFibreDimension:5-minusRank,backwardFibreDimension:5-plusRank,
    onRankineHugoniot:Math.hypot(...residual)<=tolerance*Math.max(1,Math.abs(X)),
    trivialJump:X===0,
    note:'Postos do sistema RH ambiente, não certificação da carta desingularizada nem da variedade não trivial.'}
}

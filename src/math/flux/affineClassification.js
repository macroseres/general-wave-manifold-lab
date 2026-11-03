import { flux, jacobian } from './quadraticFlux.js'
import { discriminant } from '../characteristic/spectrum.js'

export const coefficientKeys = ['a20','a11','a02','a10','a01','b20','b11','b02','b10','b01']
const det = A => A[0][0]*A[1][1]-A[0][1]*A[1][0]
export function transformQuadraticFlux(p,A,t=[0,0]) {
  const d=det(A)
  if(!Number.isFinite(d)||Math.abs(d)<1e-12||![...A.flat(),...t].every(Number.isFinite)) throw new Error('Transformação afim não invertível ou não finita')
  const inv=[[A[1][1]/d,-A[0][1]/d],[-A[1][0]/d,A[0][0]/d]]
  const mapped = V => {
    const U=[A[0][0]*V[0]+A[0][1]*V[1]+t[0],A[1][0]*V[0]+A[1][1]*V[1]+t[1]]
    const f=flux(U,p)
    return inv.map(row=>row[0]*f[0]+row[1]*f[1])
  }
  const zero=mapped([0,0]), e1=mapped([1,0]), m1=mapped([-1,0]),e2=mapped([0,1]),m2=mapped([0,-1]), e12=mapped([1,1])
  const coefficients={}
  for(const [prefix,i] of [['a',0],['b',1]]){
    coefficients[`${prefix}20`]=(e1[i]+m1[i]-2*zero[i])/2
    coefficients[`${prefix}02`]=(e2[i]+m2[i]-2*zero[i])/2
    coefficients[`${prefix}10`]=(e1[i]-m1[i])/2
    coefficients[`${prefix}01`]=(e2[i]-m2[i])/2
    coefficients[`${prefix}11`]=e12[i]-e1[i]-e2[i]+zero[i]
  }
  return {coefficients,constant:zero,determinant:d}
}
export function discriminantPolynomial(p){
  // Exact coefficient expansion of Delta=(J11-J22)^2+4 J12 J21.
  // Avoid reconstructing coefficients by sampled discriminant values,
  // which can suffer cancellation near degenerate parameter strata.
  const L=[2*p.a20-p.b11,p.a11-2*p.b02,p.a10-p.b01]
  const B=[p.a11,2*p.a02,p.a01]
  const C=[2*p.b20,p.b11,p.b10]
  const square=(i,j)=>L[i]*L[j]
  const product=(i,j)=>B[i]*C[j]
  return {
    u2:square(0,0)+4*product(0,0),
    uv:2*square(0,1)+4*(product(0,1)+product(1,0)),
    v2:square(1,1)+4*product(1,1),
    u:2*square(0,2)+4*(product(0,2)+product(2,0)),
    v:2*square(1,2)+4*(product(1,2)+product(2,1)),
    c:square(2,2)+4*product(2,2),
  }
}
export function classifyState(U,p,tolerance=1e-10){
 const J=jacobian(U,p),D=discriminant(U,p),scale=Math.max(1,...J.flat().map(Math.abs)),eps=tolerance*scale*scale
 if(D>eps)return 'hiperbólico estrito'
 if(D< -eps)return 'elíptico'
 const scalar=Math.abs(J[0][1])<=tolerance*scale&&Math.abs(J[1][0])<=tolerance*scale&&Math.abs(J[0][0]-J[1][1])<=tolerance*scale
 return scalar?'parabólico degenerado (matriz escalar)':'parabólico (autovalor duplo)'
}

/**
 * Detailed local spectral diagnosis. A tolerance-based classification is a
 * numerical observation, not a certificate of exact eigenvalue coincidence.
 * For Delta=0 a scalar 2x2 matrix has two independent eigenvectors; a
 * non-scalar matrix has only one.
 */
export function classifyStateDetailed(U,p,tolerance=1e-10){
  const J=jacobian(U,p)
  const delta=discriminant(U,p)
  const scale=Math.max(1,...J.flat().map(Math.abs))
  const threshold=tolerance*scale*scale
  const scalarResidual=Math.max(Math.abs(J[0][1]),Math.abs(J[1][0]),Math.abs(J[0][0]-J[1][1]))
  const scalar=scalarResidual<=tolerance*scale
  const exactScalar=J[0][1]===0&&J[1][0]===0&&J[0][0]===J[1][1]
  const regime=delta>threshold?'strictly-hyperbolic':delta< -threshold?'elliptic':'coincidence-near'
  // A tolerance window does not establish algebraic or geometric multiplicity.
  // Only an exactly zero computed discriminant supports a floating-point
  // equality diagnosis; this is not a symbolic proof of coincidence.
  const computedCoincidence=delta===0
  return {
    regime,discriminant:delta,threshold,
    eigenvalueMultiplicity:regime==='coincidence-near'
      ?(computedCoincidence?'double-computed':'unresolved-near')
      :'distinct',
    geometricMultiplicity:regime==='coincidence-near'&&computedCoincidence
      ?(exactScalar?2:scalar?null:1)
      :null,
    jacobianKind:exactScalar?'scalar-computed':scalar?'scalar-near':'non-scalar',
    scalarResidual,
    evidence:computedCoincidence?'floating-point-equality':'tolerance-based',
  }
}

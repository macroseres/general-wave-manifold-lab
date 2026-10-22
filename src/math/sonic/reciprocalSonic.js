import {fiberZ} from '../charts/reciprocalChart.js'
import {jacobian} from '../flux/quadraticFlux.js'
import {det2} from './sonic.js'

/** Non-trivial sonic factor in r_hat=(1,Z), regular at Z=0.
 * On chart overlap Phi_hat = Z Phi, NOT Z^2 Phi.
 */
export function reciprocalSonicImplicit(eta,Upsilon,Z,p,side){
  if(![eta,Upsilon,Z].every(Number.isFinite)||!['minus','plus'].includes(side))return NaN
  const f=fiberZ(Z,eta,p)
  if(f.kind!=='regular')return NaN
  const J=jacobian(f.Ubar,p)
  const s=(J[0][0]+J[0][1]*Z+Z*(J[1][0]+J[1][1]*Z))/(1+Z*Z)
  const M=[[2*p.a20+p.a11*Z,p.a11+2*p.a02*Z],[2*p.b20+p.b11*Z,p.b11+2*p.b02*Z]]
  const A=[[J[0][0]-s,J[0][1]],[J[1][0],J[1][1]-s]]
  const K=A[0][0]*M[1][1]+M[0][0]*A[1][1]-A[0][1]*M[1][0]-M[0][1]*A[1][0]
  return Upsilon*det2(M)+(side==='minus'?-2:2)*K
}

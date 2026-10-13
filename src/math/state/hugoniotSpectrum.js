/**
 * Spectral diagnostics at a Rankine–Hugoniot point P in the wave manifold.
 *
 * This module deliberately does NOT impose a shock admissibility criterion.
 * It only reports the ordered eigenvalues of DF(U_-), DF(U_+), the shock
 * speed s, and their signed gaps s-lambda_i.  A later admissibility module may
 * consume these invariant data without recomputing them in the UI.
 */
import { jacobian } from '../flux/quadraticFlux.js'

function orderedEigenvalues2x2(A) {
  const tr=A[0][0]+A[1][1]
  const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]
  const disc=tr*tr-4*det
  const scale=Math.max(1,Math.abs(tr*tr),Math.abs(4*det))
  if(disc < -1e-13*scale) return {kind:'complex',trace:tr,determinant:det,discriminant:disc,eigenvalues:null}
  const root=Math.sqrt(Math.max(0,disc))
  return {kind:'real',trace:tr,determinant:det,discriminant:disc,eigenvalues:[(tr-root)/2,(tr+root)/2]}
}

function sideSpectrum(U,s,p){
  const spectral=orderedEigenvalues2x2(jacobian(U,p))
  if(spectral.kind!=='real') return {...spectral,gaps:null,position:'non-hyperbolic'}
  const [l1,l2]=spectral.eigenvalues
  const gaps=[s-l1,s-l2]
  const tol=1e-11*Math.max(1,Math.abs(s),Math.abs(l1),Math.abs(l2))
  let position='between'
  if(Math.abs(gaps[0])<=tol) position='on-slow-characteristic'
  else if(Math.abs(gaps[1])<=tol) position='on-fast-characteristic'
  else if(s<l1) position='below-spectrum'
  else if(s>l2) position='above-spectrum'
  return {...spectral,gaps,position}
}

export function hugoniotSpectralDiagnostic(state,p){
  if(!state||state.kind!=='regular'||!Number.isFinite(state.s)) return {kind:'invalid-wave-state'}
  return {
    kind:'regular',
    s:state.s,
    minus:sideSpectrum(state.Um,state.s,p),
    plus:sideSpectrum(state.Up,state.s,p),
  }
}

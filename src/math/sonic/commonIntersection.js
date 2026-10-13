import { sonicIntersectionData } from './intersections.js'

/**
 * Canonical classification of S^- ∩ S^+.
 *
 * Phi_- = Y det(M) - 2K, Phi_+ = Y det(M) + 2K, hence
 * Phi_-=Phi_+=0 iff K=0 and Y det(M)=0. Therefore the common zero set is
 * exactly J ∪ DS, with J={Y=0,K=0} and DS={K=0,det(M)=0}.
 * The overlap J∩DS is reported explicitly as 'J-and-DS'.
 */
export function classifyCommonSonicPoint(tau,Y,z,p,{absoluteTolerance=1e-9}={}){
  const d=sonicIntersectionData(tau,Y,z,p)
  if(d.kind!=='regular')return {...d,common:false,locus:'nonregular'}
  const scale=Math.max(1,Math.abs(d.K),Math.abs(Y*d.detM),Math.abs(d.phiMinus),Math.abs(d.phiPlus))
  const tol=absoluteTolerance*scale
  const common=Math.abs(d.phiMinus)<=tol&&Math.abs(d.phiPlus)<=tol
  const onJ=common&&Math.abs(Y)<=absoluteTolerance&&Math.abs(d.K)<=tol
  const onDS=common&&Math.abs(d.K)<=tol&&Math.abs(d.detM)<=absoluteTolerance*Math.max(1,Math.abs(d.detM))
  const locus=onJ&&onDS?'J-and-DS':onJ?'J':onDS?'DS':common?'unclassified-common-zero':'outside'
  return {...d,common,onJ,onDS,locus,tolerance:tol}
}

export function commonSonicIdentityResidual(tau,Y,z,p){
  const d=sonicIntersectionData(tau,Y,z,p)
  if(d.kind!=='regular')return Infinity
  // Exact algebraic identities: Phi_+ - Phi_- = 4K and Phi_+ + Phi_- = 2Y det(M).
  return Math.max(
    Math.abs((d.phiPlus-d.phiMinus)-4*d.K),
    Math.abs((d.phiPlus+d.phiMinus)-2*Y*d.detM),
  )
}

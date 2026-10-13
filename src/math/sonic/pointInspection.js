import { sonicData } from './sonic.js'
import { jacobian } from '../flux/quadraticFlux.js'
import { waveState } from '../manifold/waveState.js'

// One sonicData evaluation supplies both implicit equations and the selected
// surface residual. Do not recompute the Jacobian for each displayed quantity.
export function inspectSonicPoint({tau,Y,zc,side},p){
  if(side!=='minus'&&side!=='plus')return {kind:'invalid-side'}
  if(![tau,Y,zc].every(Number.isFinite)||Math.abs(zc)>=1)return {kind:'outside-finite-chart'}
  const z=Math.tan(Math.PI*zc/2)
  const data=sonicData(tau,z,p)
  if(data.kind!=='regular')return {kind:data.kind}
  const phiMinus=Y*data.detM-2*data.K
  const phiPlus=Y*data.detM+2*data.K
  const selected=side==='minus'?phiMinus:phiPlus
  const scale=Math.max(1,Math.abs(Y*data.detM),Math.abs(2*data.K))
  const state=waveState(tau,Y,z,p)
  const U=side==='minus'?state.Um:state.Up
  const J=jacobian(U,p)
  // On the selected sonic locus, s is an eigenvalue of DF(U).
  // The other eigenvalue equals tr DF(U)-s, so the signed gap
  // distinguishes the slow and fast sonic branches without sqrt(D).
  const trace=J[0][0]+J[1][1]
  const gap=2*state.s-trace
  const spectralScale=Math.max(1,Math.abs(state.s),Math.abs(trace-state.s))
  const branch=Math.abs(gap)<=1e-8*spectralScale?'coincidence':gap<0?'slow':'fast'
  const onSonic=Math.abs(selected)/scale<=1e-6
  return {kind:'regular',z,phiMinus,phiPlus,selected,branch,onSonic,gap,trace,s:state.s,other:trace-state.s,
    relativeResidual:Math.abs(selected)/scale,
    fullResidual:Math.abs(Y*selected/4),
    detM:data.detM,K:data.K,exceptional:data.exceptional,
    // A click is on a piecewise-linear mesh; the exact implicit residual need not vanish.
    tolerance:1e-6}
}

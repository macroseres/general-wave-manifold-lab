import {flux,jacobian} from '../flux/quadraticFlux.js'

/** Diagnostic for a single direct discontinuity U_L -> U_R.
 * This is NOT a general Riemann solver and does not certify entropy admissibility.
 */
export function directShockDiagnostic(left,right,p,{relativeTolerance=1e-8}={}){
  if(![left,right].every(U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)))return {kind:'missing-states'}
  const jump=right.map((v,i)=>v-left[i])
  const magnitude=Math.hypot(...jump)
  if(magnitude<=1e-12)return {kind:'coincident',jump,magnitude}
  const fL=flux(left,p),fR=flux(right,p)
  const fluxJump=fR.map((v,i)=>v-fL[i])
  const speed=(jump[0]*fluxJump[0]+jump[1]*fluxJump[1])/(magnitude*magnitude)
  const residual=fluxJump.map((v,i)=>v-speed*jump[i])
  const residualNorm=Math.hypot(...residual)
  const relativeResidual=residualNorm/(1+Math.hypot(...fluxJump)+Math.abs(speed)*magnitude)
  const eigenvalues=U=>{
    const J=jacobian(U,p),tr=J[0][0]+J[1][1]
    const discriminant=(J[0][0]-J[1][1])**2+4*J[0][1]*J[1][0]
    return discriminant>=0?[(tr-Math.sqrt(discriminant))/2,(tr+Math.sqrt(discriminant))/2]:null
  }
  const spectrumLeft=eigenvalues(left),spectrumRight=eigenvalues(right)
  return {kind:'jump',jump,magnitude,speed,residual,residualNorm,relativeResidual,
    rankineHugoniot:relativeResidual<=relativeTolerance,
    spectrumLeft,spectrumRight,
    spectralStatus:!spectrumLeft||!spectrumRight?'nonhyperbolic-endpoint':'real-endpoint-spectra'}
}

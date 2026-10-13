import {directShockDiagnostic} from './directShockDiagnostic.js'

/** Endpoint-only weak Lax inequalities at a sonic shock. Necessary diagnostic,
 * not a viscous-profile or entropy certification. Equalities are permitted at
 * the designated sonic endpoint. */
export function sonicShockAdmissibility(left,right,p,family,sonicSide,{
  tolerance=1e-6, rhTolerance=1e-7,
}={}) {
  if (!['slow','fast'].includes(family) || !['plus','minus'].includes(sonicSide))
    return {status:'invalid-input',passes:false}
  const shock=directShockDiagnostic(left,right,p,{relativeTolerance:rhTolerance})
  if(shock.kind!=='jump' || !shock.rankineHugoniot)
    return {status:'rankine-hugoniot-failed',passes:false,shock}
  const {spectrumLeft:L,spectrumRight:R,speed:s}=shock
  if(!L||!R || !(L[1]>L[0]) || !(R[1]>R[0]))
    return {status:'non-strict-hyperbolicity',passes:false,shock}
  const k=family==='slow'?0:1, j=1-k
  const eps=tolerance*(1+Math.max(Math.abs(s),...L.map(Math.abs),...R.map(Math.abs)))
  const sonic=Math.abs(s-(sonicSide==='plus'?R[k]:L[k]))<=eps
  const compressive=L[k]>=s-eps && s>=R[k]-eps
  const transverse=k===0 ? L[j]>s-eps && R[j]>s-eps : L[j]<s+eps && R[j]<s+eps
  const passes=sonic&&compressive&&transverse
  return {status:passes?'weak-lax-endpoint-candidate':'endpoint-inequality-failed',passes,
    sonic,compressive,transverse,sonicSide,family,speed:s,spectrumLeft:L,spectrumRight:R,
    rhResidual:shock.relativeResidual}
}

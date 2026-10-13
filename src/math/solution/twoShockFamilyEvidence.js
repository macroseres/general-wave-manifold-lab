import {directShockDiagnostic} from './directShockDiagnostic.js'

/** Strict endpoint Lax checks for a non-sonic 2x2 shock.
 * These are necessary endpoint tests, not Liu/viscous-profile certificates.
 */
export function classifyLaxShock(left,right,p,{tolerance=1e-7,rhTolerance=1e-8}={}) {
  const shock=directShockDiagnostic(left,right,p,{relativeTolerance:rhTolerance})
  if(shock.kind!=='jump'||!shock.rankineHugoniot)
    return {status:'rankine-hugoniot-unverified',families:[],shock,entropyCertified:false}
  const L=shock.spectrumLeft,R=shock.spectrumRight,s=shock.speed
  if(!L||!R||!(L[1]>L[0])||!(R[1]>R[0]))
    return {status:'non-strict-hyperbolicity',families:[],shock,entropyCertified:false}
  const eps=tolerance*(1+Math.max(Math.abs(s),...L.map(Math.abs),...R.map(Math.abs)))
  const slow=L[0]>s+eps&&s>R[0]+eps&&s<L[1]-eps&&s<R[1]-eps
  const fast=L[1]>s+eps&&s>R[1]+eps&&s>L[0]+eps&&s>R[0]+eps
  const families=[...(slow?['slow']:[]),...(fast?['fast']:[])]
  return {status:families.length?'strict-lax-endpoint-candidate':'strict-lax-failed',families,shock,entropyCertified:false}
}

/** The conventional two-wave ordering is slow family then fast family.
 * Degenerate/sonic/undercompressive shocks are deliberately not accepted.
 */
export function assessTwoShockFamilyChain(left,middle,right,p,options={}) {
  const first=classifyLaxShock(left,middle,p,options)
  const second=classifyLaxShock(middle,right,p,options)
  const speedGap=second.shock?.speed-first.shock?.speed
  const ordered=Number.isFinite(speedGap)&&speedGap> (options.speedTolerance??1e-8)*(1+Math.max(Math.abs(first.shock.speed),Math.abs(second.shock.speed)))
  const familyOrdered=first.families.includes('slow')&&second.families.includes('fast')
  const status=first.status==='rankine-hugoniot-unverified'||second.status==='rankine-hugoniot-unverified'?'rankine-hugoniot-unverified':
    first.status==='non-strict-hyperbolicity'||second.status==='non-strict-hyperbolicity'?'non-strict-hyperbolicity':
    !ordered?'speed-ordering-unverified':!familyOrdered?'family-lax-unverified':'ordered-lax-endpoint-candidate'
  return {status,first,second,ordered,familyOrdered,speedGap,entropyCertified:false}
}

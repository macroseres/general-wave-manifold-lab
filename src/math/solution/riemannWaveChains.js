import {directShockDiagnostic} from './directShockDiagnostic.js'
import {assessTwoShockFamilyChain} from './twoShockFamilyEvidence.js'

const stateOK = U => Array.isArray(U) && U.length === 2 && U.every(Number.isFinite)

/** Necessary speed-ordering and RH checks for a two-shock Riemann chain.
 * The diagnostics deliberately do not certify entropy or a Riemann solution.
 */
export function assessTwoShockChain(left,middle,right,p,{relativeTolerance=1e-8,speedTolerance=1e-8}={}) {
  if(![left,middle,right].every(stateOK)) return {status:'missing-states',entropyCertified:false}
  const first=directShockDiagnostic(left,middle,p,{relativeTolerance})
  const second=directShockDiagnostic(middle,right,p,{relativeTolerance})
  if(first.kind!=='jump'||second.kind!=='jump') return {status:'degenerate-jump',first,second,entropyCertified:false}
  const rhBoth=first.rankineHugoniot&&second.rankineHugoniot
  const scale=1+Math.max(Math.abs(first.speed),Math.abs(second.speed))
  const gap=second.speed-first.speed
  const ordered=gap>speedTolerance*scale
  const status=!rhBoth?'rankine-hugoniot-unverified':!ordered?'speed-ordering-unverified':'ordered-rh-candidate'
  return {status,first,second,speedGap:gap,rhBoth,ordered,entropyCertified:false}
}

export function assessTwoShockCandidates(left,right,candidates,p,options={}) {
  return (candidates??[]).map(candidate=>({
    ...candidate,
    chainEvidence:assessTwoShockChain(left,candidate.middle,right,p,options),
    familyEvidence:assessTwoShockFamilyChain(left,candidate.middle,right,p,options),
  }))
}

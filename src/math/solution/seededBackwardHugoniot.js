import {traceSeededForwardHugoniot} from './seededForwardHugoniot.js'
import {attachForwardSonicEndpoint} from './seededContactEndpoint.js'
import {directShockDiagnostic} from './directShockDiagnostic.js'

/** Geometric backward Hugoniot continuation: U_R is fixed and U_- varies.
 * Rankine–Hugoniot is symmetric under endpoint exchange, so the forward
 * incidence curve can be reused with U_R as the fixed endpoint. The physical
 * shock orientation, however, remains U_- -> U_R; this function DOES NOT
 * apply the forward Liu inequality to that reversed shock.
 */
export function traceSeededBackwardHugoniot(right, contact, p, options={}) {
  const target=contact?.refinement?.status==='converged' &&
    contact?.sonicSide==='minus' ? contact.refinement.point : null
  if (!target) return {status:'unrefined-backward-contact',arc:null,passes:false}
  const traced=traceSeededForwardHugoniot(right,target,p,{
    ...options,family:contact.family,
  })
  if (!traced.arc) return {status:traced.status,arc:null,passes:false}
  const endpoint=attachForwardSonicEndpoint(right,traced.arc,target,p,options)
  if (!endpoint.arc) return {status:`endpoint-${endpoint.status}`,arc:null,passes:false}
  const shock=directShockDiagnostic(target,right,p)
  if (!shock.rankineHugoniot) return {status:'backward-rh-failed',arc:null,passes:false}
  return {
    status:'backward-arc-numerically-connected',
    arc:endpoint.arc, family:traced.family, sign:traced.sign,
    endpointGap:endpoint.gap, relativeResidual:shock.relativeResidual,
    shockSpeed:shock.speed, passes:false,
    liuStatus:'not-evaluated',
    qualification:'Backward Hugoniot geometry and RH only; Liu must be evaluated with the correct U_- to U_R shock orientation',
  }
}

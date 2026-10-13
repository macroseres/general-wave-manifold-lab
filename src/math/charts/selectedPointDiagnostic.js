import {zFromZc} from './zChart.js'
import {toReciprocal} from './reciprocalTransition.js'
import {waveState} from '../manifold/waveState.js'

/** Read-only diagnostics: a reciprocal chart does not bound physical states. */
export function selectedPointDiagnostic(point,p){
  const {tau,Y,zc}=point
  if(![tau,Y,zc].every(Number.isFinite)||Math.abs(zc)>=1)return {kind:'outside-chart'}
  const z=zFromZc(zc)
  const Z=1/z
  const X=z*Y
  const nearInfinity=Math.abs(zc)>=0.9
  const state=waveState(tau,Y,z,p)
  const reciprocal=nearInfinity?toReciprocal(tau,Y,z,p):null
  const magnitude=state.kind==='regular'?Math.max(Math.abs(state.s),...state.Ubar.map(Math.abs),...state.Um.map(Math.abs),...state.Up.map(Math.abs)):NaN
  return {kind:state.kind,z,Z,X,nearInfinity,reciprocal,physicalMagnitude:magnitude,
    largePhysicalValues:Number.isFinite(magnitude)&&magnitude>=1e4,
    // No assertion of a numerical error: the finite chart's tangent grows with z.
    warning:nearInfinity?'A carta z está próxima do seu limite. Valores físicos grandes podem ser reais; compare os invariantes na carta recíproca.':null}
}

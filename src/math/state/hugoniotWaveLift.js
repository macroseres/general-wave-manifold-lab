import { fiber, zcFromZ } from '../charts/zChart.js'
import { waveState, rhResidual } from '../manifold/waveState.js'

/**
 * Reconstruct a finite-chart wave-manifold point from ordered shock endpoints.
 * The projective chart r=(z,1) is invalid for vertical jump denominator dv=0.
 * Return an explicit status rather than silently fabricating a lift.
 */
export function liftHugoniotSample(Um, Up, p, {relativeTolerance=1e-6, chartTolerance=1e-9}={}) {
  if (![Um,Up].every(U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite))) return {kind:'invalid-endpoints'}
  const du=Up[0]-Um[0],dv=Up[1]-Um[1],norm=Math.hypot(du,dv)
  if(norm<=chartTolerance*Math.max(1,Math.hypot(...Um),Math.hypot(...Up)))return {kind:'coincidence',reason:'zero-jump'}
  if(Math.abs(dv)<=chartTolerance*norm)return {kind:'outside-finite-z-chart',reason:'horizontal-jump'}
  const z=du/dv,Y=dv
  if(!Number.isFinite(z))return {kind:'outside-finite-z-chart'}
  const middle=[(Um[0]+Up[0])/2,(Um[1]+Up[1])/2]
  const f=fiber(z,0,p)
  if(f.kind!=='regular')return {kind:'degenerate-fiber',fiberKind:f.kind,z,Y}
  const t=f.tangent,den=t[0]*t[0]+t[1]*t[1]
  if(den<=0)return {kind:'degenerate-fiber',z,Y}
  const tau=((middle[0]-f.base[0])*t[0]+(middle[1]-f.base[1])*t[1])/den
  const point=waveState(tau,Y,z,p)
  if(point.kind!=='regular')return {kind:'degenerate-fiber',z,Y}
  const projectionError=Math.hypot(point.Um[0]-Um[0],point.Um[1]-Um[1],point.Up[0]-Up[0],point.Up[1]-Up[1])
  const scale=Math.max(1,Math.hypot(...Um),Math.hypot(...Up))
  const relativeProjectionError=projectionError/scale
  const relativeRHResidual=rhResidual(point,p)/Math.max(1,Math.hypot(...Um),Math.hypot(...Up),Math.abs(point.s)*norm)
  const data={tau,Y,z,zc:zcFromZ(z),s:point.s,relativeProjectionError,relativeRHResidual}
  if(relativeProjectionError>relativeTolerance||relativeRHResidual>relativeTolerance)
    return {kind:'not-certified',...data}
  return {kind:'regular',...data}
}

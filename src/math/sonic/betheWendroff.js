import { jacobian } from '../flux/quadraticFlux.js'
import { waveState } from '../manifold/waveState.js'
import { zFromZc } from '../charts/zChart.js'

// Bethe-Wendroff: on S^±, det(DF(U_±)-sI)=0. Thus the
// discriminant equals the squared trace, and BT^± is trace=0.
export function betheWendroffData(tau,Y,zc,p,side){
  if(side!=='minus'&&side!=='plus')return {kind:'invalid-side'}
  if(![tau,Y,zc].every(Number.isFinite)||Math.abs(zc)>=1)return {kind:'outside-finite-chart'}
  const state=waveState(tau,Y,zFromZc(zc),p)
  if(state.kind!=='regular')return {kind:state.kind}
  const A=jacobian(side==='minus'?state.Um:state.Up,p)
  const a=A[0][0]-state.s,b=A[0][1],c=A[1][0],d=A[1][1]-state.s
  const trace=a+d,det=a*d-b*c,discriminant=trace*trace-4*det
  return {kind:'regular',trace,det,discriminant,gap:-trace,side}
}

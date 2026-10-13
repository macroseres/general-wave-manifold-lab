import { fiber, zcFromZ } from './zChart.js'
import { reciprocalHopfAt } from '../sonic/hopfReciprocal.js'
import { waveState } from '../manifold/waveState.js'
import { jacobian } from '../flux/quadraticFlux.js'

/** Projective overlap: (X,Y)=(zY,Y)=(X,ZX), Z=1/z.
 * At Z=0 the reciprocal chart is valid, but the finite-z chart is not.
 * No point at infinity is added to the finite-z renderer.
 */
export function toReciprocal(tau,Y,z,p){
  if(![tau,Y,z].every(Number.isFinite)||z===0)return {kind:'outside-overlap'}
  const state=waveState(tau,Y,z,p)
  if(state.kind!=='regular')return {kind:state.kind}
  const Z=1/z,X=z*Y
  const G=(u,v)=>{const A=jacobian([u,v],p);return A[1][0]+Z*(A[1][1]-A[0][0])-Z*Z*A[0][1]}
  const c=G(0,0),a=G(1,0)-c,b=G(0,1)-c
  const coordinate=Math.abs(a)>=Math.abs(b)&&Math.abs(a)>1e-12?'v':Math.abs(b)>1e-12?'u':null
  if(!coordinate)return {kind:'degenerate-eigendirection'}
  return {kind:'regular',Z,X,free:coordinate==='v'?state.Ubar[1]:state.Ubar[0],coordinate,Ubar:state.Ubar,Um:state.Um,Up:state.Up,s:state.s}
}

export function fromReciprocal(free,X,Z,p){
  if(![free,X,Z].every(Number.isFinite)||Z===0)return {kind:'outside-overlap'}
  const h=reciprocalHopfAt(free,X,Z,p,'plus')
  if(h.kind!=='regular')return {kind:h.kind}
  const z=1/Z,Y=Z*X
  const f=fiber(z,0,p)
  if(f.kind!=='regular')return {kind:f.kind}
  const d=[h.Ubar[0]-f.base[0],h.Ubar[1]-f.base[1]]
  const denom=f.tangent[0]**2+f.tangent[1]**2
  const tau=(d[0]*f.tangent[0]+d[1]*f.tangent[1])/denom
  const state=waveState(tau,Y,z,p)
  if(state.kind!=='regular')return {kind:state.kind}
  return {kind:'regular',tau,Y,z,zc:zcFromZ(z),Ubar:state.Ubar,Um:state.Um,Up:state.Up,s:state.s,projectionResidual:Math.hypot(state.Ubar[0]-h.Ubar[0],state.Ubar[1]-h.Ubar[1])}
}

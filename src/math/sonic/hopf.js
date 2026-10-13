import { sonicData, directionalJacobian } from './sonic.js'
import { jacobian } from '../flux/quadraticFlux.js'
import { zFromZc } from '../charts/zChart.js'

/** Hopf^±: tr(DF(U_±)-sI)=0 and det(DF(U_±)-sI)>0.
 * On the trace-zero sheet the discriminant is -4 det; BT is det=0.
 * A point with det<0 is NOT on Hopf, even though its trace vanishes.
 */
export function hopfAt(tau,Y,zc,p,side){
  if(side!=='minus'&&side!=='plus')return {kind:'invalid-side'}
  if(![tau,Y,zc].every(Number.isFinite)||Math.abs(zc)>=1)return {kind:'outside-chart'}
  const z=zFromZc(zc), d=sonicData(tau,z,p)
  if(d.kind!=='regular')return {kind:d.kind}
  const J=jacobian(d.Ubar,p), M=directionalJacobian(z,p)
  const g0=2*d.s-J[0][0]-J[1][1]
  const t=M[0][0]+M[1][1]
  const sign=side==='minus'?1:-1
  const gap=g0+sign*Y*t/2
  const A00=J[0][0]-d.s-sign*Y*M[0][0]/2
  const A01=J[0][1]-sign*Y*M[0][1]/2
  const A10=J[1][0]-sign*Y*M[1][0]/2
  const A11=J[1][1]-d.s-sign*Y*M[1][1]/2
  const det=A00*A11-A01*A10
  return {kind:'regular',gap,trace:-gap,det,discriminant:gap*gap-4*det,phi:side==='minus'?Y*d.detM-2*d.K:Y*d.detM+2*d.K}
}

/** Exact trace-zero Y at fixed (tau,zc); null if the trace equation is degenerate. */
export function hopfHeight(tau,zc,p,side,tol=1e-11){
  if(side!=='minus'&&side!=='plus')return null
  const z=zFromZc(zc),d=sonicData(tau,z,p)
  if(d.kind!=='regular')return null
  const J=jacobian(d.Ubar,p),M=directionalJacobian(z,p)
  const t=M[0][0]+M[1][1],g0=2*d.s-J[0][0]-J[1][1]
  if(Math.abs(t)<=tol)return null // vertical/degenerate trace sheet: cannot graph Y(tau,z)
  return (side==='minus'?-2:2)*g0/t
}

/** Alternative trace-zero chart: solve for tau at fixed (Y,zc).
 * For quadratic fluxes, the trace is affine in tau. A zero slope means
 * this chart is singular and must not be used.
 */
export function hopfTau(Y,zc,p,side,tol=1e-11){
  const h0=hopfAt(0,Y,zc,p,side)
  const h1=hopfAt(1,Y,zc,p,side)
  if(h0.kind!=='regular'||h1.kind!=='regular')return null
  const slope=h1.trace-h0.trace
  if(!Number.isFinite(slope)||Math.abs(slope)<=tol)return null
  const tau=-h0.trace/slope
  return Number.isFinite(tau)?tau:null
}

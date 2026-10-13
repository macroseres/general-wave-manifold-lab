import { flux, jacobian } from './quadraticFlux.js'
import { discriminant } from '../characteristic/spectrum.js'

export const coefficientKeys = ['a20','a11','a02','a10','a01','b20','b11','b02','b10','b01']
const det = A => A[0][0]*A[1][1]-A[0][1]*A[1][0]
export function transformQuadraticFlux(p,A,t=[0,0]) {
  const d=det(A)
  if(!Number.isFinite(d)||Math.abs(d)<1e-12||![...A.flat(),...t].every(Number.isFinite)) throw new Error('Transformação afim não invertível ou não finita')
  const inv=[[A[1][1]/d,-A[0][1]/d],[-A[1][0]/d,A[0][0]/d]]
  const mapped = V => {
    const U=[A[0][0]*V[0]+A[0][1]*V[1]+t[0],A[1][0]*V[0]+A[1][1]*V[1]+t[1]]
    const f=flux(U,p)
    return inv.map(row=>row[0]*f[0]+row[1]*f[1])
  }
  const zero=mapped([0,0]), e1=mapped([1,0]), m1=mapped([-1,0]),e2=mapped([0,1]),m2=mapped([0,-1]), e12=mapped([1,1])
  const coefficients={}
  for(const [prefix,i] of [['a',0],['b',1]]){
    coefficients[`${prefix}20`]=(e1[i]+m1[i]-2*zero[i])/2
    coefficients[`${prefix}02`]=(e2[i]+m2[i]-2*zero[i])/2
    coefficients[`${prefix}10`]=(e1[i]-m1[i])/2
    coefficients[`${prefix}01`]=(e2[i]-m2[i])/2
    coefficients[`${prefix}11`]=e12[i]-e1[i]-e2[i]+zero[i]
  }
  return {coefficients,constant:zero,determinant:d}
}
export function discriminantPolynomial(p){
  const D=(u,v)=>discriminant([u,v],p)
  const c=D(0,0),up=D(1,0),um=D(-1,0),vp=D(0,1),vm=D(0,-1)
  return {u2:(up+um-2*c)/2,uv:D(1,1)-up-vp+c,v2:(vp+vm-2*c)/2,u:(up-um)/2,v:(vp-vm)/2,c}
}
export function classifyState(U,p,tolerance=1e-10){
 const J=jacobian(U,p),D=discriminant(U,p),scale=Math.max(1,...J.flat().map(Math.abs)),eps=tolerance*scale*scale
 if(D>eps)return 'hiperbólico estrito'
 if(D< -eps)return 'elíptico'
 const scalar=Math.abs(J[0][1])<=tolerance*scale&&Math.abs(J[1][0])<=tolerance*scale&&Math.abs(J[0][0]-J[1][1])<=tolerance*scale
 return scalar?'parabólico degenerado (matriz escalar)':'parabólico (autovalor duplo)'
}

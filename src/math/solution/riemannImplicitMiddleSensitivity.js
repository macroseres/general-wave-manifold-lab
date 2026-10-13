import {flux} from '../flux/quadraticFlux.js'

const coefficients=['a20','a11','a02','a10','a01','b20','b11','b02','b10','b01']
const valid=U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)
const determinant=(a,b)=>a[0]*b[1]-a[1]*b[0]
const diff=(a,b)=>[a[0]-b[0],a[1]-b[1]]
const shockDet=(a,b,p)=>determinant(diff(b,a),diff(flux(b,p),flux(a,p)))
const basis=(U,k)=>{const [u,v]=U;return k.endsWith('20')?u*u:k.endsWith('11')?u*v:k.endsWith('02')?v*v:k.endsWith('10')?u:v}
const parameterDerivative=(a,b,k)=>{
  const jump=diff(b,a),q=basis(b,k)-basis(a,k)
  return k.startsWith('a')?-jump[1]*q:jump[0]*q
}
/** Implicit-function derivative of a two-shock intermediate state.
 * Solve D(L,M;p)=D(M,R;p)=0 at fixed L,R. This does not trace branches,
 * check Lax/Liu, or prove the local continuation is globally selected.
 */
export function implicitTwoShockMiddleSensitivity(left,middle,right,p,{step=1e-5,relativeResidualTolerance=1e-7,singularTolerance=1e-9}={}){
  const unavailable=status=>({status,rows:[],entropyCertified:false})
  if(![left,middle,right].every(valid)||!p||!(step>0))return unavailable('invalid-input')
  const r=[shockDet(left,middle,p),shockDet(middle,right,p)]
  const scale=1+Math.max(...[left,middle,right].flatMap(U=>[...U,...flux(U,p)].map(Math.abs)))**3
  if(Math.max(...r.map(Math.abs))>relativeResidualTolerance*scale)return unavailable('not-on-both-hugoniot-loci')
  const derivative=(index,axis)=>{
    const h=step*(1+Math.abs(middle[axis]))
    const plus=[...middle],minus=[...middle];plus[axis]+=h;minus[axis]-=h
    const f= index===0?U=>shockDet(left,U,p):U=>shockDet(U,right,p)
    return (f(plus)-f(minus))/(2*h)
  }
  const A=[[derivative(0,0),derivative(0,1)],[derivative(1,0),derivative(1,1)]]
  const det=determinant(A[0],A[1])
  const norm=Math.hypot(...A[0],...A[1])
  if(!(norm>0)||Math.abs(det)<=singularTolerance*norm*norm)return {...unavailable('singular-or-ill-conditioned-intersection'),jacobian:A,normalizedDeterminant:norm?det/(norm*norm):null}
  const rows=coefficients.map(coefficient=>{
    const b0=-parameterDerivative(left,middle,coefficient)
    const b1=-parameterDerivative(middle,right,coefficient)
    const du=(b0*A[1][1]-A[0][1]*b1)/det
    const dv=(A[0][0]*b1-b0*A[1][0])/det
    return {coefficient,derivative:[du,dv]}
  })
  return {status:'local-implicit-derivative',rows,jacobian:A,normalizedDeterminant:det/(norm*norm),residuals:r,entropyCertified:false}
}

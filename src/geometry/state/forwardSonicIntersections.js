import {reciprocalSonicImplicit} from '../../math/sonic/reciprocalSonic.js'
import {jacobian} from '../../math/flux/quadraticFlux.js'
import {stateFiberPoint,stateFiberPointReciprocal} from '../../math/state/fibers.js'
import {sonicImplicit} from '../../math/sonic/sonic.js'
import {waveState} from '../../math/manifold/waveState.js'
import {zcFromZ} from '../../math/charts/zChart.js'

const add=(a,b)=>Array.from({length:Math.max(a.length,b.length)},(_,i)=>(a[i]??0)+(b[i]??0))
const scale=(a,k)=>a.map(x=>x*k)
const mul=(a,b)=>{const c=Array(a.length+b.length-1).fill(0);a.forEach((x,i)=>b.forEach((y,j)=>{c[i+j]+=x*y}));return c}
const sub=(a,b)=>add(a,scale(b,-1))
const value=(a,x)=>a.reduceRight((v,c)=>v*x+c,0)
const derivative=a=>a.slice(1).map((x,i)=>x*(i+1))

/** Isolate monotone polynomial intervals using derivative roots. Repeated roots
 * are tested at the critical points, so tangencies need no sign change. */
export function boundedPolynomialRoots(coefficients){
  let a=[...coefficients],norm=Math.max(...a.map(Math.abs))
  if(!norm)return []
  a=a.map(x=>x/norm)
  while(a.length>1&&Math.abs(a.at(-1))<1e-13)a.pop()
  if(a.length<2)return []
  if(a.length===2){const x=-a[0]/a[1];return x>=-1-1e-12&&x<=1+1e-12?[Math.max(-1,Math.min(1,x))]:[]}
  const critical=boundedPolynomialRoots(derivative(a)),cuts=[-1,...critical.filter(x=>x>-1&&x<1),1],roots=[]
  const push=x=>{if(!roots.some(y=>Math.abs(x-y)<1e-8))roots.push(x)}
  for(const x of cuts)if(Math.abs(value(a,x))<1e-11)push(x)
  for(let i=1;i<cuts.length;i++){
    let lo=cuts[i-1],hi=cuts[i],v=value(a,lo)
    if(v*value(a,hi)>=0)continue
    for(let j=0;j<70;j++){const mid=(lo+hi)/2,f=value(a,mid);if(v*f<=0)hi=mid;else{lo=mid;v=f}}
    push((lo+hi)/2)
  }
  return roots.sort((a,b)=>a-b)
}

/** Exact polynomial numerator of Y det(M)-2K on pi-minus inverse(U).
 * Denominators are cleared algebraically; each root is checked in W afterwards.
 */
export function forwardSonicPolynomial(U,p,sonicSide='minus'){
  const z=[0,1],P=[-p.a11,p.b11-2*p.a20,2*p.b20],Q=[-2*p.a02,2*p.b02-p.a11,p.b11],R=[-p.a01,p.b01-p.a10,p.b10]
  const den=add(mul(P,z),Q),L=add(add(scale(P,U[0]),scale(Q,U[1])),R),Yn=scale(L,-2)
  const un=add(scale(den,U[0]),scale(mul(Yn,z),.5)),vn=add(scale(den,U[1]),scale(Yn,.5))
  const J=[[add(add(scale(un,2*p.a20),scale(vn,p.a11)),scale(den,p.a10)),add(add(scale(un,p.a11),scale(vn,2*p.a02)),scale(den,p.a01))],
    [add(add(scale(un,2*p.b20),scale(vn,p.b11)),scale(den,p.b10)),add(add(scale(un,p.b11),scale(vn,2*p.b02)),scale(den,p.b01))]]
  const sn=add(mul(J[1][0],z),J[1][1]),A=[[sub(J[0][0],sn),J[0][1]],[J[1][0],sub(J[1][1],sn)]]
  const M=[[[p.a11,2*p.a20],[2*p.a02,p.a11]],[[p.b11,2*p.b20],[2*p.b02,p.b11]]]
  const det=sub(mul(M[0][0],M[1][1]),mul(M[0][1],M[1][0]))
  const K=sub(add(mul(A[0][0],M[1][1]),mul(M[0][0],A[1][1])),add(mul(A[0][1],M[1][0]),mul(M[0][1],A[1][0])))
  return add(mul(Yn,det),scale(K,sonicSide==='plus'?2:-2))
}

export function forwardSonicIntersections(U,p,sonicSide='minus'){
  if(!Array.isArray(U)||U.length!==2||!U.every(Number.isFinite))return {points:[],status:'missing-state',infinityCount:0,sonicSide}
  const coefficients=forwardSonicPolynomial(U,p,sonicSide),norm=Math.max(...coefficients.map(Math.abs))
  if(norm<1e-13*(1+Math.max(...jacobian(U,p).flat().map(Math.abs))))return {points:[],status:'non-isolated-sonic-set',infinityCount:0,sonicSide}
  const points=[];let infinityCount=0
  for(const reciprocal of [false,true]){
    const polynomial=reciprocal?[...coefficients].reverse():coefficients
    for(const x of boundedPolynomialRoots(polynomial)){
      if(reciprocal&&Math.abs(x)<1e-12){const q=stateFiberPointReciprocal(U,0,p,'minus');if(q.kind==='regular'&&Math.abs(reciprocalSonicImplicit(q.eta,q.Upsilon,0,p,sonicSide))<1e-8)infinityCount++;continue}
      const z=reciprocal?1/x:x,q=stateFiberPoint(U,z,p,'minus')
      if(q.kind!=='regular'||![q.tau,q.Y].every(Number.isFinite))continue
      if(reciprocal&&stateFiberPointReciprocal(U,x,p,'minus').kind!=='regular')continue
      const residual=Math.abs(sonicImplicit(q.tau,q.Y,z,p,sonicSide)),w=waveState(q.tau,q.Y,z,p)
      if(!Number.isFinite(residual)||residual>1e-7||w.kind!=='regular'||Math.hypot(...w.Um.map((v,i)=>v-U[i]))>1e-7)continue
      const zc=zcFromZ(z)
      if(points.some(r=>Math.hypot(r.tau-q.tau,r.Y-q.Y,r.zc-zc)<1e-6))continue
      const d=Math.abs(value(derivative(polynomial),x))/Math.max(1,...polynomial.map(Math.abs))
      points.push({tau:q.tau,Y:q.Y,zc,z,residual,tangency:d<1e-7})
    }
  }
  points.sort((a,b)=>a.zc-b.zc)
  return {points:points.map((q,i)=>({...q,id:`forward-${sonicSide==='plus'?'plus-':''}sonic-${i+1}`,index:i+1})),status:'finite-roots-verified',infinityCount,sonicSide}
}

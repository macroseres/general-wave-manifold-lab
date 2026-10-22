import {flux,jacobian} from '../flux/quadraticFlux.js'
import {cubicRealRoots} from '../numerics/polynomialRoots.js'
import {stateCharacteristicDirection} from '../rarefaction/stateIntegralCurves.js'
import {sonicShockAdmissibility} from './sonicShockAdmissibility.js'

const cross=(a,b)=>a[0]*b[1]-a[1]*b[0]

/** Isolated finite-amplitude sonic partners for a quadratic flux, in states.
 * Both projective charts are used algebraically, without manifold coordinates.
 * Degenerate continua and zero-amplitude roots are not enumerated.
 */
export function quadraticSonicPartners(U,p,family,side,{minimumJump=1e-5,tolerance=1e-7}={}){
  const keys=['a20','a11','a02','a10','a01','b20','b11','b02','b10','b01']
  if(!Array.isArray(U)||U.length!==2||!U.every(Number.isFinite)||!['left','right'].includes(side)||
    !p||!keys.every(k=>Number.isFinite(p[k]))||![minimumJump,tolerance].every(v=>Number.isFinite(v)&&v>0))return []
  const eigen=stateCharacteristicDirection(U,p,family)
  if(!eigen)return []
  const J=jacobian(U,p),s=eigen.lambda,result=[]
  const B=r=>[(J[0][0]-s)*r[0]+J[0][1]*r[1],J[1][0]*r[0]+(J[1][1]-s)*r[1]]
  const H=([x,y])=>[2*(p.a20*x*x+p.a11*x*y+p.a02*y*y),2*(p.b20*x*x+p.b11*x*y+p.b02*y*y)]
  for(const chart of ['finite','reciprocal']){
    const direction=x=>chart==='finite'?[x,1]:[1,x]
    const f=x=>{const r=direction(x);return cross(B(r),H(r))}
    const c0=f(0),v1=f(1),vm=f(-1),v2=f(2)
    const c2=(v1+vm-2*c0)/2,odd=(v1-vm)/2,c3=(v2-c0-4*c2-2*odd)/6,c1=odd-c3
    const scale=Math.max(1,Math.abs(c0),Math.abs(c1),Math.abs(c2),Math.abs(c3))
    for(const x of cubicRealRoots(c3/scale,c2/scale,c1/scale,c0/scale)){
      const raw=direction(x),norm=Math.hypot(...raw),r=raw.map(v=>v/norm),h=H(r),b=B(r),den=h[0]**2+h[1]**2
      if(den<1e-24)continue
      const a=-2*(b[0]*h[0]+b[1]*h[1])/den
      if(!Number.isFinite(a)||Math.abs(a)<minimumJump)continue
      const V=U.map((v,i)=>v+a*r[i])
      if(!V.every(Number.isFinite)||!stateCharacteristicDirection(V,p,family))continue
      const from=side==='left'?U:V,to=side==='left'?V:U
      const evidence=sonicShockAdmissibility(from,to,p,family,side==='left'?'minus':'plus',{tolerance,rhTolerance:tolerance})
      if(!evidence.passes)continue
      // Independent fixed-speed RH check rejects cubic roots lost to roundoff.
      const F0=flux(from,p),F1=flux(to,p)
      const residual=Math.hypot(...F1.map((v,i)=>v-F0[i]-s*(to[i]-from[i])))/(1+Math.hypot(...F0)+Math.hypot(...F1)+Math.abs(s*a))
      if(residual>tolerance||result.some(q=>Math.hypot(...q.point.map((v,i)=>v-V[i]))<minimumJump))continue
      result.push({point:V,speed:s,from:[...from],to:[...to],family,sonicSide:side==='left'?'minus':'plus',
        relativeResidual:residual,evidence,source:'quadratic-state-sonic-equations'})
    }
  }
  return result
}

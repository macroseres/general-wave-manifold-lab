import { jacobian } from '../flux/quadraticFlux.js'
import { waveState } from '../manifold/waveState.js'
import { sonicImplicit } from '../sonic/sonic.js'

// S^- is affine in tau at fixed (Y,z). This chart stays regular at
// projection folds where parametrizing by the generating rarefaction fails.
function minusChart(Y,z,p){
  const constant=sonicImplicit(0,Y,z,p,'minus')
  const slope=sonicImplicit(1,Y,z,p,'minus')-constant
  if(!Number.isFinite(slope)||Math.abs(slope)<1e-8)return null
  const tau=-constant/slope
  const state=waveState(tau,Y,z,p)
  return state.kind==='regular'?{tau,Y,z,...state}:null
}

function slope(Y,z,p){
  const q=minusChart(Y,z,p)
  const h=1e-5*Math.max(1,Math.abs(z))
  const before=minusChart(Y,z-h,p),after=minusChart(Y,z+h,p)
  const shifted=minusChart(Y+1,z,p)
  if(!q||!before||!after||!shifted)return NaN
  // ZIP field: rotate a row of (DF(pi_-)-sI) Dpi_-.
  const dY=shifted.Um.map((x,i)=>x-q.Um[i])
  const dz=after.Um.map((x,i)=>(x-before.Um[i])/(2*h))
  const rows=jacobian(q.Um,p).map((row,i)=>{
    const m=row.map((x,j)=>x-(i===j?q.s:0))
    return [m[0]*dY[0]+m[1]*dY[1],m[0]*dz[0]+m[1]*dz[1]]
  })
  const [a,b]=Math.abs(rows[0][0])>=Math.abs(rows[1][0])?rows[0]:rows[1]
  return Math.abs(a)>1e-8?-b/a:NaN
}

export function integrateMinusCompositeFold(origin,z,p){
  const steps=Math.max(1,Math.ceil(Math.abs(z-origin.z)/.001))
  if(steps>64)return null
  const h=(z-origin.z)/steps
  let Y=origin.Y
  for(let i=0;i<steps;i++){
    const x=origin.z+i*h
    const a=slope(Y,x,p),b=slope(Y+h*a/2,x+h/2,p)
    const c=slope(Y+h*b/2,x+h/2,p),d=slope(Y+h*c,x+h,p)
    Y+=h*(a+2*b+2*c+d)/6
    if(!Number.isFinite(Y))return null
  }
  return minusChart(Y,z,p)
}

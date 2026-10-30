import {sonicData,sonicImplicit} from '../../math/sonic/sonic.js'
import {stateFiberPoint} from '../../math/state/fibers.js'
import {zFromZc} from '../../math/charts/zChart.js'
import {characteristicSpectrum} from '../../math/characteristic/spectrum.js'

function roots(samples,evaluate){
  const result=[]
  const add=q=>{if(q&&Math.abs(q.value)<1e-8&&!result.some(r=>Math.hypot(r.tau-q.tau,r.Y-q.Y,r.zc-q.zc)<1e-6))result.push(q)}
  for(let i=1;i<samples.length;i++){
    let lo=samples[i-1],hi=samples[i],a=evaluate(lo),b=evaluate(hi)
    if(!a||!b)continue
    add(a);add(b)
    if(a.value*b.value>=0)continue
    for(let j=0;j<60;j++){
      const mid=(lo+hi)/2,q=evaluate(mid)
      if(!q)break
      if(Math.abs(q.value)<1e-9){add(q);break}
      if(a.value*q.value<=0){hi=mid;b=q}else{lo=mid;a=q}
    }
  }
  return result.map(q=>({tau:q.tau,Y:q.Y,zc:q.zc}))
}

export function rightWaveJunctions(fastCurve,U,p){
  const fastInflection=[]
  for(let i=1;i<(fastCurve?.points.length??0);i++){
    const a=fastCurve.points[i-1],b=fastCurve.points[i]
    const found=roots([0,1],t=>{
      const tau=a.tau+t*(b.tau-a.tau),zc=a.zc+t*(b.zc-a.zc),z=zFromZc(zc)
      const d=sonicData(tau,z,p),s=characteristicSpectrum(tau,z,p)
      return d.kind==='regular'&&s.branch==='fast'?{tau,Y:0,zc,value:d.K}:null
    })
    for(const q of found)if(!fastInflection.some(r=>Math.hypot(r.tau-q.tau,r.zc-q.zc)<1e-6))fastInflection.push(q)
  }
  const backwardMinus=Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)?roots(Array.from({length:1441},(_,i)=>-.999999+1.999998*i/1440),zc=>{
    const z=zFromZc(zc),q=stateFiberPoint(U,z,p,'plus')
    if(q.kind!=='regular'||Math.abs(q.Y)<1e-8||![q.tau,q.Y].every(Number.isFinite))return null
    const value=sonicImplicit(q.tau,q.Y,z,p,'minus')
    return Number.isFinite(value)?{tau:q.tau,Y:q.Y,zc,value}:null
  }):[]
  return {fastInflection,backwardMinus}
}

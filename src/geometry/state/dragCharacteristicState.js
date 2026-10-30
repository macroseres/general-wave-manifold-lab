import {characteristicSpectrum} from '../../math/characteristic/spectrum.js'
import {zFromZc} from '../../math/charts/zChart.js'

/** Keep a dragged marker on its original strict characteristic component. */
export function dragCharacteristicState(from,target,p,branch,{tauMin,tauMax}){
  const valid=q=>{
    if(![q.tau,q.zc].every(Number.isFinite)||q.tau<tauMin||q.tau>tauMax||Math.abs(q.zc)>.996)return null
    const data=characteristicSpectrum(q.tau,zFromZc(q.zc),p)
    return data.kind==='regular'&&data.branch===branch&&Math.abs(data.gap)>1e-5*(1+Math.abs(data.s)+Math.abs(data.other))?data:null
  }
  if(!valid(from)||!['slow','fast'].includes(branch))return null
  const end={tau:Math.max(tauMin,Math.min(tauMax,target.tau)),zc:Math.max(-.996,Math.min(.996,target.zc))}
  if(![end.tau,end.zc].every(Number.isFinite))return null
  const at=t=>({tau:from.tau+t*(end.tau-from.tau),zc:from.zc+t*(end.zc-from.zc)})
  let t=0
  for(let i=1;i<=32;i++){
    const next=i/32
    if(valid(at(next))){t=next;continue}
    let lo=t,hi=next
    for(let j=0;j<32;j++){const mid=(lo+hi)/2;if(valid(at(mid)))lo=mid;else hi=mid}
    t=lo;break
  }
  const point=at(t),data=valid(point)
  return data?{point:{...point,Y:0},state:[...data.Ubar],branch}:null
}

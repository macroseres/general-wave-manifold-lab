import {useMemo} from 'react'
import {rarefactionPhysicalProfiles} from '../geometry/physical/rarefactionProfiles.js'

const W=680,H=170,P=40
function ProfilePlot({data,component}){
  const values=data.points.map(q=>q[component]);const min=Math.min(...values),max=Math.max(...values),pad=Math.max(.1,(max-min)*.12),low=min-pad,high=max+pad
  const sx=x=>P+(x-data.xMin)/(data.xMax-data.xMin)*(W-2*P)
  const sy=y=>H-P-(y-low)/(high-low)*(H-2*P)
  const d=data.points.map((q,i)=>`${i?'L':'M'}${sx(q.x).toFixed(2)},${sy(q[component]).toFixed(2)}`).join(' ')
  return <div className="physicalProfilePlot"><h3>{component}(x,t)</h3><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Perfil físico de ${component} no tempo ${data.time}`}><rect width={W} height={H} className="chartBg"/><line x1={P} x2={W-P} y1={H-P} y2={H-P} className="physicalAxis"/>{[data.fanLeft,data.fanRight].filter(x=>x>=data.xMin&&x<=data.xMax).map((x,i)=><line key={i} x1={sx(x)} x2={sx(x)} y1={P/2} y2={H-P} stroke="currentColor" strokeDasharray="4 5" opacity=".35"/>)}<path d={d} fill="none" stroke="#0a84ff" strokeWidth="2.5"/><text x={W-P} y={H-12} textAnchor="end" className="physicalLabel">x</text></svg></div>
}
export default function PhysicalProfiles({solution,time,tMax=time}){
 const data=useMemo(()=>rarefactionPhysicalProfiles(solution,{time,tMax}),[solution,time,tMax])
 if(!data)return null
 return <section className="physicalProfiles" aria-label="Perfis da rarefação no espaço físico"><h3>Perfis físicos da órbita selecionada</h3><p>Extensões constantes fora do leque; ainda não representam uma solução global certificada do problema de Riemann.</p><div className="physicalProfileGrid"><ProfilePlot data={data} component="u"/><ProfilePlot data={data} component="v"/></div></section>
}

import {useMemo} from 'react'
import {candidatePhysicalGeometry,candidatePhysicalProfiles} from '../geometry/physical/riemannCandidatePhysical.js'

const W=720,H=360,P=54
const fmt=x=>Number(x).toPrecision(5)
function CandidateProfile({data,component}){
  const values=[...data.points.map(q=>q[component]),...data.shockTraces.flatMap(q=>[q.left[component==='u'?0:1],q.right[component==='u'?0:1]])],low=Math.min(...values),high=Math.max(...values),pad=Math.max(0.1,(high-low)*0.12)
  const sx=x=>P+(x-data.xMin)/(data.xMax-data.xMin)*(W-2*P)
  const sy=y=>H-55-(y-(low-pad))/(high-low+2*pad)*(H-110)
  // Insert exact one-sided traces. Do not connect across a discontinuity.
  const segments=[]
  let current=[]
  const shocks=[...data.shockTraces].sort((a,b)=>a.x-b.x)
  const push=()=>{if(current.length)segments.push(current);current=[]}
  let next=0
  for(const q of data.points){
    while(next<shocks.length&&shocks[next].x<=q.x){
      const jump=shocks[next++]
      if(jump.x>=data.xMin&&jump.x<=data.xMax){
        current.push({x:jump.x,[component]:jump.left[component==='u'?0:1]})
        push()
        current.push({x:jump.x,[component]:jump.right[component==='u'?0:1]})
      }
    }
    current.push(q)
  }
  push()
  return <div className="physicalProfilePlot"><h3>{component}(x,t)</h3><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Perfil candidato ${component} no tempo ${data.time}`}><rect width={W} height={H} className="chartBg"/><line x1={P} x2={W-P} y1={H-55} y2={H-55} className="physicalAxis"/>{data.shocks.map((s,i)=><line key={`s${i}`} x1={sx(s*data.time)} x2={sx(s*data.time)} y1={P} y2={H-55} stroke="#ff9f0a" strokeDasharray="5 5"/>)}{segments.map((seg,i)=><path key={i} d={seg.map((q,j)=>`${j?'L':'M'}${sx(q.x)},${sy(q[component])}`).join(' ')} fill="none" stroke="#0a84ff" strokeWidth="2.5"/>)}<text x={W-P} y={H-15} textAnchor="end" className="physicalLabel">x</text></svg></div>
}
export default function RiemannCandidatePhysical({candidate,tMax,time,profilesOnly=false}){
  const geometry=useMemo(()=>candidatePhysicalGeometry(candidate,{tMax}),[candidate,tMax])
  const profiles=useMemo(()=>candidatePhysicalProfiles(candidate,{time,tMax}),[candidate,time,tMax])
  if(!geometry||!profiles)return <p>Não foi possível construir o perfil candidato.</p>
  if(profilesOnly)return <section className="physicalProfiles"><h3>Perfis candidatos em t={time.toFixed(2)}</h3><p>Visualização numérica amostrada, sem certificação entrópica ou seleção de unicidade.</p><div className="physicalProfileGrid"><CandidateProfile data={profiles} component="u"/><CandidateProfile data={profiles} component="v"/></div></section>
  const sx=x=>P+(x-geometry.xMin)/(geometry.xMax-geometry.xMin)*(W-2*P)
  const sy=t=>H-P-t/tMax*(H-2*P)
  const middle=candidate.kind==='two-shock'?candidate.states?.[1]:candidate.middle
  return <div><p className="localChartNote"><b>Estado intermediário U_M:</b> {middle?.map(fmt).join(' , ')??'não disponível'} · <b>Admissibilidade:</b> candidato numérico; não certificado.</p><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cadeia candidata de ondas no espaço físico x t"><rect width={W} height={H} className="chartBg"/><line x1={P} x2={W-P} y1={sy(0)} y2={sy(0)} className="physicalAxis"/><line x1={sx(0)} x2={sx(0)} y1={P} y2={H-P} className="physicalAxis"/>{geometry.fans.map((fan,i)=><g key={i}><polygon points={`${sx(0)},${sy(0)} ${sx(fan.left*tMax)},${sy(tMax)} ${sx(fan.right*tMax)},${sy(tMax)}`} fill="#0a84ff" opacity=".15"/>{fan.rays.map((s,j)=><line key={j} x1={sx(0)} y1={sy(0)} x2={sx(s*tMax)} y2={sy(tMax)} stroke="#0a84ff" opacity=".5" strokeWidth="1"/>)}</g>)}{geometry.shocks.map((s,i)=><line key={i} x1={sx(0)} y1={sy(0)} x2={sx(s*tMax)} y2={sy(tMax)} stroke="#ff9f0a" strokeWidth="3"/>)}<text x={W-P} y={H-14} textAnchor="end" className="physicalLabel">x</text><text x={sx(0)+8} y={P+14} className="physicalLabel">t</text></svg><p className="localChartNote">Choques (laranja; saltos não conectados nos perfis): {geometry.shocks.map(fmt).join(' · ')}. Leques (azul): {geometry.fans.length?geometry.fans.map(f=>`[${fmt(f.left)}, ${fmt(f.right)}]`).join(' · '):'nenhum'}. Velocidades em ξ=x/t.</p></div>
}

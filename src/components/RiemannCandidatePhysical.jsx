import {useId,useMemo,useState} from 'react'
import {candidatePhysicalGeometry,candidatePhysicalProfiles} from '../geometry/physical/riemannCandidatePhysical.js'
import {evaluateSelfSimilarCandidate} from '../math/solution/riemannSelfSimilarCandidate.js'
import {MathLabel} from './math/MathLabel.jsx'

const W=720,H=360,P=54
const fmt=x=>Number(x).toPrecision(5)
const krColor='#0a84ff'
const rrColor='#2dd4bf'
const rrDash='6 4'

function ProfileComparisonLegend(){
  return <p><span style={{color:krColor}}>━</span> KR · <span style={{color:rrColor}}>┄</span> RR</p>
}

function ShockProfileDetail({candidate,comparison,trace,halfWidth,index,component,id,open,onToggle}){
  const clipId=useId()
  const coordinate=component==='u'?0:1
  const left=trace.left[coordinate],right=trace.right[coordinate]
  const pad=Math.abs(right-left)*.25
  const reference=evaluateSelfSimilarCandidate(comparison,trace.speed)?.[coordinate]??right
  const min=Math.min(left,right,reference)-pad,max=Math.max(left,right,reference)+pad
  const width=480,height=166,center=width/2,top=15,bottom=133
  const y=value=>bottom-(value-min)/(max-min)*(bottom-top)
  const comparisonSpeeds=comparison?[
    ...Array.from({length:161},(_,i)=>trace.speed+(i/80-1)*halfWidth),
    ...comparison.fans.flatMap(fan=>fan.speeds).filter(speed=>Math.abs(speed-trace.speed)<halfWidth),
  ].sort((a,b)=>a-b):[]
  const comparisonPoints=comparisonSpeeds.map(speed=>{
    const state=evaluateSelfSimilarCandidate(comparison,speed)
    return [center+(speed-trace.speed)/halfWidth*(center-24),y(state[coordinate])].join(',')
  }).join(' ')
  const branches=[-1,1].map((side)=>{
    const points=[[center,y(side<0?left:right)]]
    for(let i=1;i<=80;i++){
      const fraction=side*i/80
      const state=evaluateSelfSimilarCandidate(candidate,trace.speed+fraction*halfWidth)
      if(!Number.isFinite(state?.[coordinate]))break
      points.push([center+fraction*(center-24),y(state[coordinate])])
    }
    return points.map(point=>point.join(',')).join(' ')
  })
  return <details id={id} className="workspaceDisclosure" open={open} onToggle={event=>onToggle(event.currentTarget.open)}>
    <summary>Ampliação local de <MathLabel>{component}</MathLabel> · choque {index+1}</summary>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Ampliação do salto em ${component} no choque ${index+1}`}>
      <defs><clipPath id={clipId}><rect x="24" y={top} width={width-48} height={bottom-top}/></clipPath></defs>
      <rect width={width} height={height} className="chartBg"/>
      <line x1="24" x2={width-24} y1={bottom} y2={bottom} className="physicalAxis"/>
      <line x1={center} x2={center} y1={top} y2={bottom} stroke="#ff9f0a" strokeDasharray="4 4"/>
      <g clipPath={`url(#${clipId})`}>
        {branches.map((points,i)=><polyline key={i} points={points} fill="none" stroke={krColor} strokeWidth="2"/>)}
        {comparisonPoints&&<polyline aria-label="Perfil RR" points={comparisonPoints} fill="none" stroke={rrColor} strokeWidth="2.5" strokeDasharray={rrDash}/>}
      </g>
      <circle cx={center} cy={y(left)} r="4" fill="#ff9f0a" aria-label="Traço esquerdo"/>
      <circle cx={center} cy={y(right)} r="4" fill="#ff9f0a" aria-label="Traço direito"/>
      <text x={center} y={height-12} textAnchor="middle" className="physicalLabel">x = {fmt(trace.x)}</text>
    </svg>
    {comparisonPoints&&<ProfileComparisonLegend/>}
    <p><MathLabel>{`${component}^-`}</MathLabel> = {left.toPrecision(9)} · <MathLabel>{`${component}^+`}</MathLabel> = {right.toPrecision(9)} · <MathLabel>{String.raw`\Delta ${component}`}</MathLabel> = {fmt(right-left)} · <MathLabel>{String.raw`\xi`}</MathLabel> = {fmt(trace.speed)}</p>
  </details>
}
function CandidateProfile({data,component,candidate,comparison,comparisonPoints}){
  const zoomId=useId()
  const [openZooms,setOpenZooms]=useState({})
  const isZoomOpen=index=>openZooms[index]??(index===0)
  const setZoomOpen=(index,open)=>setOpenZooms(previous=>
    (previous[index]??(index===0))===open?previous:{...previous,[index]:open})
  const coordinate=component==="u"?0:1
  const values=[...data.points.map(q=>q[component]),...comparisonPoints.map(q=>q[component]),...data.jumpTraces.flatMap(q=>[q.left[component==='u'?0:1],q.right[component==='u'?0:1]])],low=Math.min(...values),high=Math.max(...values),pad=Math.max(0.1,(high-low)*0.12)
  const sx=x=>P+(x-data.xMin)/(data.xMax-data.xMin)*(W-2*P)
  const sy=y=>H-55-(y-(low-pad))/(high-low+2*pad)*(H-110)
  const zooms=candidate&&(component==='v'||candidate.pattern==='KR')
    ?data.shockTraces.filter(trace=>trace.left[coordinate]!==trace.right[coordinate]).map(trace=>{
      const halfWidth=Math.min(
        (component==='u'?.00005:.005)*Math.max(1,Math.abs(trace.speed)),
        ...data.jumpTraces.filter(jump=>jump.speed!==trace.speed)
          .map(jump=>Math.abs(jump.speed-trace.speed)/2),
      )
      return {trace,halfWidth,xMin:trace.x-halfWidth*data.time,xMax:trace.x+halfWidth*data.time}
    }):[]
  const path=points=>points.map((q,i)=>`${i?'L':'M'}${sx(q.x)},${sy(q[component])}`).join(' ')
  // Insert exact one-sided traces. Do not connect across a discontinuity.
  const segments=[]
  let current=[]
  const shocks=[...data.jumpTraces].sort((a,b)=>a.x-b.x)
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
  return <div className="physicalProfilePlot">
    <h3>{component}(x,t)</h3>
    <svg viewBox={`0 0 ${W} ${H}`} role={zooms.length?'group':'img'} aria-label={`Perfil candidato ${component} no tempo ${data.time}`}>
      <rect width={W} height={H} className="chartBg"/>
      {zooms.map(({trace,xMin,xMax},index)=>{
        const center=sx(trace.x)
        const open=isZoomOpen(index)
        const toggle=()=>setZoomOpen(index,!open)
        return <g key={index} role="button" tabIndex={0} aria-expanded={open} aria-controls={`${zoomId}-${index}`}
          aria-label={`Alternar zoom de ${component} · choque ${index+1}`} style={{cursor:'pointer'}} onClick={toggle}
          onKeyDown={event=>{
            if(event.key==='Enter'||event.key===' '){
              event.preventDefault()
              toggle()
            }
          }}>
          <title>{`Zoom ${component} · x ∈ [${xMin.toPrecision(8)}, ${xMax.toPrecision(8)}]`}</title>
          <rect x={sx(xMin)} y={P} width={sx(xMax)-sx(xMin)} height={H-55-P} fill="#ff9f0a" fillOpacity=".24"/>
          <rect x={center-12} y={P-22} width="24" height="28" fill="transparent"/>
          <path d={`M${center-7},${P-12} H${center+7} L${center},${P} Z`} fill="#ff9f0a"/>
        </g>
      })}
      <line x1={P} x2={W-P} y1={H-55} y2={H-55} className="physicalAxis"/>
      {data.shocks.map((s,i)=><line key={`s${i}`} x1={sx(s*data.time)} x2={sx(s*data.time)} y1={P} y2={H-55} stroke="#ff9f0a" strokeDasharray="5 5" pointerEvents="none"/>)}
      {data.contacts.map((s,i)=><line key={`c${i}`} x1={sx(s*data.time)} x2={sx(s*data.time)} y1={P} y2={H-55} stroke="#bf5af2" strokeDasharray="3 4"/>)}
      {segments.map((seg,i)=><path key={i} aria-label={comparison?"Perfil KR":undefined} d={path(seg)} fill="none" stroke={krColor} strokeWidth="2.5"/>)}
      {comparisonPoints.length>0&&<path aria-label="Perfil RR" d={path(comparisonPoints)} fill="none" stroke={rrColor} strokeWidth="2.5" strokeDasharray={rrDash}/>}
      <text x={W-P} y={H-15} textAnchor="end" className="physicalLabel">x</text>
    </svg>
    {zooms.map(({trace,halfWidth},index)=><ShockProfileDetail key={index} component={component} candidate={candidate}
      comparison={comparison} trace={trace} halfWidth={halfWidth} index={index} id={`${zoomId}-${index}`}
      open={isZoomOpen(index)} onToggle={open=>setZoomOpen(index,open)}/>)}
  </div>
}

export default function RiemannCandidatePhysical({candidate,tMax,time,profilesOnly=false,comparison}){
  const geometry=useMemo(()=>candidatePhysicalGeometry(candidate,{tMax}),[candidate,tMax])
  const profiles=useMemo(()=>candidatePhysicalProfiles(candidate,{time,tMax}),[candidate,time,tMax])
  const comparisonPoints=useMemo(()=>{
    if(!comparison||!profiles)return []
    const fanPositions=comparison.fans.flatMap(fan=>fan.speeds.map(speed=>speed*time))
      .filter(x=>x>profiles.xMin&&x<profiles.xMax)
    const positions=[...profiles.points.map(point=>point.x),...fanPositions].sort((a,b)=>a-b)
    return positions.map(x=>{
      const [u,v]=evaluateSelfSimilarCandidate(comparison,x/time)
      return {x,u,v}
    })
  },[comparison,profiles,time])
  if(!geometry||!profiles)return <p>Não foi possível construir o perfil candidato.</p>
  if(profilesOnly)return <section className="physicalProfiles">
    <h3>Perfis candidatos em t={time.toFixed(2)}</h3>
    <p>Visualização numérica amostrada, sem certificação entrópica ou seleção de unicidade.</p>
    {comparisonPoints.length>0&&<ProfileComparisonLegend/>}
    <div className="physicalProfileGrid">
      <CandidateProfile data={profiles} component="u" candidate={candidate} comparison={comparison} comparisonPoints={comparisonPoints}/>
      <CandidateProfile data={profiles} component="v" candidate={candidate} comparison={comparison} comparisonPoints={comparisonPoints}/>
    </div>
  </section>
  const sx=x=>P+(x-geometry.xMin)/(geometry.xMax-geometry.xMin)*(W-2*P)
  const sy=t=>H-P-t/tMax*(H-2*P)
  const middle=candidate.kind==='two-shock'?candidate.states?.[1]:candidate.middle
  return <div><p className="localChartNote"><b>Estado intermediário U_M:</b> {middle?.map(fmt).join(' , ')??'não disponível'} · <b>Admissibilidade:</b> candidato numérico; não certificado.</p><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cadeia candidata de ondas no espaço físico x t"><rect width={W} height={H} className="chartBg"/><line x1={P} x2={W-P} y1={sy(0)} y2={sy(0)} className="physicalAxis"/><line x1={sx(0)} x2={sx(0)} y1={P} y2={H-P} className="physicalAxis"/>{geometry.fans.map((fan,i)=><g key={i}><polygon points={`${sx(0)},${sy(0)} ${sx(fan.left*tMax)},${sy(tMax)} ${sx(fan.right*tMax)},${sy(tMax)}`} fill="#0a84ff" opacity=".15"/>{fan.rays.map((s,j)=><line key={j} x1={sx(0)} y1={sy(0)} x2={sx(s*tMax)} y2={sy(tMax)} stroke="#0a84ff" opacity=".5" strokeWidth="1"/>)}</g>)}{geometry.shocks.map((s,i)=><line key={i} x1={sx(0)} y1={sy(0)} x2={sx(s*tMax)} y2={sy(tMax)} stroke="#ff9f0a" strokeWidth="3"/>)}{geometry.contacts.map((s,i)=><line key={`contact-${i}`} x1={sx(0)} y1={sy(0)} x2={sx(s*tMax)} y2={sy(tMax)} stroke="#bf5af2" strokeWidth="3" strokeDasharray="6 4"/>)}<text x={W-P} y={H-14} textAnchor="end" className="physicalLabel">x</text><text x={sx(0)+8} y={P+14} className="physicalLabel">t</text></svg><p className="localChartNote">Choques (laranja; saltos não conectados nos perfis): {geometry.shocks.map(fmt).join(' · ')}. Contatos (roxo): {geometry.contacts.length?geometry.contacts.map(fmt).join(' · '):'nenhum'}. Leques (azul): {geometry.fans.length?geometry.fans.map(f=>`[${fmt(f.left)}, ${fmt(f.right)}]`).join(' · '):'nenhum'}. Velocidades em ξ=x/t.</p></div>
}

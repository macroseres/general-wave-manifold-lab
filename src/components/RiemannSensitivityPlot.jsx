import {sensitivityPlotRows,sensitivityPlotScale} from '../math/solution/riemannSensitivityPlot.js'

export default function RiemannSensitivityPlot({trials}){
  const rows=sensitivityPlotRows(trials)
  const scale=sensitivityPlotScale(rows)
  if(!rows.length)return null
  const width=620,left=100,right=24,top=24,rowHeight=31,height=top+rows.length*rowHeight+28
  const center=left+(width-left-right)/2
  const half=(width-left-right)/2-10
  const position=value=>center+value/scale*half
  return <div className="rhSensitivityPlot" style={{overflowX:'auto',marginTop:'0.7rem'}}>
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{minWidth:420,maxWidth:680}} role="img" aria-label="Deslocamentos da raiz de Hugoniot por coeficiente: círculos azuis para perturbação negativa, quadrados alaranjados para positiva; cruzes indicam acompanhamento inconclusivo">
      <line x1={center} x2={center} y1={top-8} y2={height-24} stroke="currentColor" opacity="0.45" strokeDasharray="3 4"/>
      <text x={center} y={12} fontSize="11" fill="currentColor" textAnchor="middle">Δt = 0</text>
      {rows.map((r,i)=>{
        const y=top+i*rowHeight+11
        return <g key={r.coefficient}>
          <text x={left-10} y={y+4} fontSize="12" textAnchor="end" fill="currentColor">{r.coefficient}</text>
          <line x1={left} x2={width-right} y1={y+12} y2={y+12} stroke="currentColor" opacity="0.1"/>
          {r.minus!==null?<circle cx={position(r.minus)} cy={y-4} r="4.5" fill="#58a6ff"><title>{`${r.coefficient}, −h: Δt = ${r.minus.toExponential(4)}`}</title></circle>:<text x={width-right-6} y={y-3} fill="#d6a75c" textAnchor="end" fontSize="13"><title>Raiz não identificada para −h</title>×</text>}
          {r.plus!==null?<rect x={position(r.plus)-4} y={y+2} width="8" height="8" fill="#f2a65a"><title>{`${r.coefficient}, +h: Δt = ${r.plus.toExponential(4)}`}</title></rect>:<text x={width-right-6} y={y+10} fill="#d6a75c" textAnchor="end" fontSize="13"><title>Raiz não identificada para +h</title>×</text>}
        </g>
      })}
      <text x={left} y={height-6} fontSize="11" fill="currentColor">−{scale===null?'—':scale.toExponential(2)}</text>
      <text x={width-right} y={height-6} fontSize="11" fill="currentColor" textAnchor="end">+{scale===null?'—':scale.toExponential(2)}</text>
    </svg>
    <small>● −h (azul) · ■ +h (laranja) · × raiz não identificada. Escala horizontal comum: Δt, parâmetro do segmento, não tempo físico. {scale===null?'Nenhuma raiz perturbada foi identificada.':''}</small>
  </div>
}

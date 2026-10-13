import {useEffect,useMemo} from 'react'
import {infinityRarefactionSeparatrices,infinityRarefactionSingularities} from '../math/quadraticFlux.js'
import {reciprocalChartGeometry,reciprocalChartToUnit} from '../geometry/rarefaction/localChart.js'

const W=760,H=520,P=54
const sx=(q,g)=>P+reciprocalChartToUnit(q,g).x*(W-2*P)
const sy=(q,g)=>H-P-reciprocalChartToUnit(q,g).y*(H-2*P)
const path=(pts,g)=>pts.map((q,i)=>`${i?'L':'M'} ${sx(q,g).toFixed(2)} ${sy(q,g).toFixed(2)}`).join(' ')
const endpoint=(c)=>c.orientedPoints[c.orientedPoints.length-1]

export default function LocalChartDialog({open,onClose,p,showStable=true,showUnstable=true}){
  useEffect(()=>{
    if(!open)return undefined
    const key=e=>{if(e.key==='Escape')onClose()}
    window.addEventListener('keydown',key)
    return()=>window.removeEventListener('keydown',key)
  },[open,onClose])
  const data=useMemo(()=>{
    if(!open)return null
    const singularity=infinityRarefactionSingularities(p)[0]
    if(!singularity)return null
    const separatrices=infinityRarefactionSeparatrices(p,{steps:1200,ZMax:.6})
    return {singularity,geometry:reciprocalChartGeometry(separatrices,singularity,{etaRadius:.55,ZRadius:.55})}
  },[open,p])
  if(!open)return null
  if(!data?.geometry)return <div className="localChartBackdrop" onPointerDown={onClose}><section className="localChartDialog" onPointerDown={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="local-chart-empty-title"><header><div><h2 id="local-chart-empty-title">Carta local da rarefação</h2><p>Nenhuma singularidade isolada em Z=0 para estes parâmetros.</p></div><button onClick={onClose}>Fechar</button></header></section></div>
  const {singularity,g}= {singularity:data.singularity,g:data.geometry}
  const curves=g.curves.filter(c=>c.stable?showStable:showUnstable)
  const zeroY=sy({eta:g.etaMin,Z:0},g),zeroX=sx({eta:singularity.eta,Z:g.ZMin},g)
  return <div className="localChartBackdrop" onPointerDown={onClose}>
    <section className="localChartDialog" onPointerDown={e=>e.stopPropagation()} aria-modal="true" role="dialog" aria-labelledby="local-chart-title">
      <header><div><h2 id="local-chart-title">Carta local (η, Z)</h2><p>Sela da rarefação no infinito · retrato na carta recíproca</p></div><button onClick={onClose}>Fechar</button></header>
      <div className="localChartBody">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Retrato local da sela no infinito na carta eta Z">
          <defs>
            <marker id="stableArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,4 L0,8 z" className="stableArrowHead"/></marker>
            <marker id="unstableArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,4 L0,8 z" className="unstableArrowHead"/></marker>
          </defs>
          <rect x="0" y="0" width={W} height={H} className="chartBg"/>
          <line x1={P} x2={W-P} y1={zeroY} y2={zeroY} className="chartInfinity"/>
          <line x1={zeroX} x2={zeroX} y1={P} y2={H-P} className="chartAxis"/>
          {curves.map(c=><g key={c.id}>
            <path d={path(c.orientedPoints,g)} className={c.stable?'chartStable':'chartUnstable'} markerEnd={`url(#${c.stable?'stableArrow':'unstableArrow'})`}/>
            {endpoint(c)&&<text x={sx(endpoint(c),g)+(c.branch<0?-8:8)} y={sy(endpoint(c),g)-8} textAnchor={c.branch<0?'end':'start'} className="chartBranchLabel">{c.label}</text>}
          </g>)}
          <circle cx={sx(g.singularity,g)} cy={sy(g.singularity,g)} r="6" className="chartSaddle"/>
          <text x={sx(g.singularity,g)+10} y={sy(g.singularity,g)-10} className="chartSaddleLabel">p∞</text>
          <text x={W-P} y={zeroY-9} textAnchor="end" className="chartBoundaryLabel">Z=0 · fronteira projetiva</text>
          <text x={W-P} y={H-16} textAnchor="end">η</text><text x={zeroX+10} y={P+12}>Z</text>
        </svg>
        <div className="localChartLegend"><span><i className="stableSwatch"/>Wˢ · fluxo → sela</span><span><i className="unstableSwatch"/>Wᵘ · fluxo ← sela</span><span>p∞=({singularity.eta.toFixed(5)}, 0)</span><span>λ: {singularity.eigenvalues?.map(x=>x.toFixed(3)).join(', ')}</span></div>
        <p className="localChartNote"><b>Leitura:</b> as setas mostram a orientação do campo de rarefação. Os dois ramos estáveis permanecem em Z=0; os instáveis entram em Z&gt;0 e Z&lt;0. A carta global não recebe uma projeção artificial desses ramos de fronteira para z_c=±1.</p>
      </div>
    </section>
  </div>
}

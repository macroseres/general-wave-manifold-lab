import {useEffect,useMemo,useRef,useState} from 'react'
import TablerNavIcon from './TablerNavIcon.jsx'
import {coefficientKeys,transformQuadraticFlux,discriminantPolynomial,classifyState} from '../math/flux/affineClassification.js'
import {discriminant} from '../math/characteristic/spectrum.js'
import WorkspaceRail from './WorkspaceRail.jsx'
import WorkspaceDrawer from './WorkspaceDrawer.jsx'
import WorkspacePanelBody from './WorkspacePanelBody.jsx'
import { MathLabel, MathBlock } from './math/MathLabel.jsx'
import {classifyConic} from '../math/flux/conicClassification.js'
import ParameterClassification from './ParameterClassification.jsx'
import {parameterClassification} from '../math/flux/parameterClassification.js'
import {sampleParameterDiagram} from '../math/flux/parameterDiagram.js'

const coefficientText = key => String(key).replace(/\d/g, digit => '₀₁₂₃₄₅₆₇₈₉'[Number(digit)])
const coefficientLatex = (key) => String(key).replace(/^([ab])(\d)(\d)$/, (_, letter, i, j) => `${letter}_{${i}${j}}`)

export default function ParametersWorkspace({p,setP}){
 const [activePanel,setActivePanel]=useState('flux')
 const [sidebarOpen,setSidebarOpen]=useState(true)
 const [A,setA]=useState([[1,0],[0,1]])
 const [t,setT]=useState([0,0])
 const [sample,setSample]=useState([0,0])
 const [error,setError]=useState('')
 const [original,setOriginal]=useState(null)
 const [referenceMessage,setReferenceMessage]=useState('')
 const saveReference=()=>{setOriginal({...p});setReferenceMessage('Fluxo atual guardado como referência nesta sessão.')}
 const restoreReference=()=>{if(original){setP({...original});setReferenceMessage('Fluxo de referência restaurado.')}}
 const [axes,setAxes]=useState(['a20','b20'])
 const [span,setSpan]=useState(2)
 const [diagramCenter,setDiagramCenter]=useState(null)
 const [inspectedCell,setInspectedCell]=useState(null)
 const mapRef=useRef(null)
 const mapGesture=useRef(null)
 const [mapDragging,setMapDragging]=useState(false)
 const colors={compacto:'#56b68c',vazio:'#7d8796',hiperbólico:'#e8aa62',parabólico:'#77b9e9',retas:'#c79adf',degenerado:'#e17d88'}
 const categoryLabels={compacto:'Elipse / ponto',vazio:'Sem pontos reais',hiperbólico:'Hipérbole / retas concorrentes',parabólico:'Parábola',retas:'Retas paralelas / reta',degenerado:'Outras degenerações'}
 const center=diagramCenter??[Number(p[axes[0]])||0,Number(p[axes[1]])||0]
 const xMin=center[0]-span,xMax=center[0]+span,yMin=center[1]-span,yMax=center[1]+span
 const resolution=41
 const diagram=useMemo(()=>sampleParameterDiagram(p,axes[0],axes[1],xMin,xMax,yMin,yMax,resolution),[p,axes,xMin,xMax,yMin,yMax])
 const selectAxis=(index,value)=>{setAxes(old=>old.map((v,i)=>i===index?value:v));setDiagramCenter(null);setInspectedCell(null)}
 const mapPoint=(svg,event)=>{
  const matrix=svg.getScreenCTM()
  if(!matrix)return null
  const q=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse())
  return {x:(q.x-50)/369,y:(q.y-16)/369}
 }
 const inPlot=q=>q&&q.x>=0&&q.x<=1&&q.y>=0&&q.y<=1
 const moveMap=(nextCenter,nextSpan=span)=>{
  if(!nextCenter.every(Number.isFinite)||!Number.isFinite(nextSpan)||nextSpan<=0||
    nextCenter.some(c=>c-nextSpan>=c+nextSpan))return
  setDiagramCenter(nextCenter);setSpan(nextSpan);setInspectedCell(null)
 }
 const startMapGesture=event=>{
  if(event.button!==0||mapGesture.current)return
  const q=mapPoint(event.currentTarget,event)
  if(!inPlot(q))return
  event.preventDefault()
  event.currentTarget.focus({preventScroll:true})
  mapGesture.current={id:event.pointerId,q,client:[event.clientX,event.clientY],center:[...center],span,moved:false}
  event.currentTarget.setPointerCapture(event.pointerId)
 }
 const dragMap=event=>{
  const g=mapGesture.current
  if(!g||g.id!==event.pointerId)return
  const q=mapPoint(event.currentTarget,event)
  if(!q)return
  if(!g.moved&&Math.hypot(event.clientX-g.client[0],event.clientY-g.client[1])<4)return
  g.moved=true;setMapDragging(true)
  moveMap([g.center[0]-(q.x-g.q.x)*2*g.span,g.center[1]+(q.y-g.q.y)*2*g.span],g.span)
 }
 const endMapGesture=event=>{
  const g=mapGesture.current
  if(!g||g.id!==event.pointerId)return
  const q=mapPoint(event.currentTarget,event)
  if(event.type==='pointerup'&&!g.moved&&inPlot(q)){
    const i=Math.min(40,Math.floor(q.x*41)),j=Math.min(40,Math.floor(q.y*41)),cell=diagram[j*41+i]
    setDiagramCenter([...center]);setInspectedCell({x:cell.x,y:cell.y,i,j})
  }
  mapGesture.current=null;setMapDragging(false)
  if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)
 }
 // A non-passive wheel listener prevents page scrolling only over the plot.
 useEffect(()=>{
  const svg=mapRef.current
  if(!svg)return
  const wheel=event=>{
    const q=mapPoint(svg,event)
    if(!inPlot(q))return
    event.preventDefault()
    if(mapGesture.current)return
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?369:1)
    const nextSpan=Math.max(1e-6,Math.min(1e12,span*Math.exp(Math.max(-1.4,Math.min(1.4,delta*.0015)))))
    const nextCenter=[xMin+2*span*q.x-nextSpan*(2*q.x-1),yMax-2*span*q.y-nextSpan*(1-2*q.y)]
    if(nextCenter.every(Number.isFinite)&&nextCenter.every(c=>c-nextSpan<c+nextSpan)){
      setSpan(nextSpan);setDiagramCenter(nextCenter);setInspectedCell(null)
    }
  }
  svg.addEventListener('wheel',wheel,{passive:false})
  return ()=>svg.removeEventListener('wheel',wheel)
 },[span,xMin,yMax])
 const centerMapAtPointer=event=>{
  const q=mapPoint(event.currentTarget,event)
  if(!inPlot(q))return
  event.preventDefault()
  moveMap([xMin+2*span*q.x,yMax-2*span*q.y])
 }
 const mapKey=event=>{
  const shifts={ArrowLeft:[-.2,0],ArrowRight:[.2,0],ArrowUp:[0,.2],ArrowDown:[0,-.2]}
  if(shifts[event.key]){event.preventDefault();moveMap(center.map((c,i)=>c+shifts[event.key][i]*span))}
  else if(['+','=','-'].includes(event.key)){event.preventDefault();moveMap([...center],Math.max(1e-6,Math.min(1e12,span*(event.key==='-'?1.25:.8))))}
 }

 const applyInspectedCell=()=>{if(!inspectedCell)return;setP(old=>({...old,[axes[0]]:inspectedCell.x,[axes[1]]:inspectedCell.y}))}
 const inspectedFlux=useMemo(()=>inspectedCell?{...p,[axes[0]]:inspectedCell.x,[axes[1]]:inspectedCell.y}:null,[p,axes,inspectedCell])
 const currentClassification=useMemo(()=>parameterClassification(p),[p])
 const inspectedClassification=useMemo(()=>inspectedFlux?parameterClassification(inspectedFlux):null,[inspectedFlux])
 const inspectedConic=useMemo(()=>inspectedFlux?classifyConic(discriminantPolynomial(inspectedFlux)):null,[inspectedFlux])
 const inspectedDelta=inspectedFlux?discriminant(sample,inspectedFlux):null
 const polynomial=useMemo(()=>discriminantPolynomial(p),[p])
 const preview=useMemo(()=>{try{return transformQuadraticFlux(p,A,t)}catch{return null}},[p,A,t])
 const setMatrix=(i,j,v)=>setA(old=>old.map((r,k)=>k===i?r.map((x,l)=>l===j?v:x):r))
 const apply=()=>{try{const next=transformQuadraticFlux(p,A,t);setOriginal(old=>old??{...p});setP(next.coefficients);setA([[1,0],[0,1]]);setT([0,0]);setError('Transformação aplicada; termo constante removido (não afeta a lei de conservação).')}catch(e){setError(e.message)}}
 const q=polynomial
 const latexNumber=(value,digits=4)=>{const n=Number(value);return Number.isFinite(n)?n.toPrecision(digits).replace(/e([+-]?\d+)/,(_,exponent)=>String.raw`\times 10^{${Number(exponent)}}`):String(value)}
 const deltaLatex=String.raw`\Delta(u,v) = ` + [
  `${latexNumber(q.u2)}u^{2}`, `${latexNumber(q.uv)}uv`, `${latexNumber(q.v2)}v^{2}`,
  `${latexNumber(q.u)}u`, `${latexNumber(q.v)}v`, latexNumber(q.c)
 ].map((term,i)=>i===0?term:term.startsWith('-')?` - ${term.slice(1)}`:` + ${term}`).join('')
 const conic=useMemo(()=>classifyConic(polynomial),[polynomial])
 return <div className="parametersWorkspace parametersWorkspace--unified workspaceLayout workspaceLayout--parameters">
  <div className="parametersUnifiedLayout">
   <WorkspaceRail
    items={[{id:'settings',label:'Fluxo',description:'Editar os coeficientes compartilhados'},{id:'charts',label:'Diagrama',description:'Escolher os eixos e a região do mapa'},{id:'geometry',label:'Transformar',description:'Preparar e aplicar uma transformação afim'},{id:'reference',label:'Referência',description:'Guardar, comparar e restaurar o fluxo'}]}
    active={{flux:'settings',transform:'geometry',diagram:'charts',reference:'reference'}[activePanel]}
    expanded={sidebarOpen}
    onSelect={id=>{setActivePanel({settings:'flux',geometry:'transform',charts:'diagram',reference:'reference'}[id]);setSidebarOpen(true)}}
    onCollapse={()=>setSidebarOpen(v=>!v)}
    ariaLabel="Seções dos parâmetros"
   />
   {sidebarOpen&&<WorkspaceDrawer as="aside" className="parametersControlSidebar" aria-label="Controles dos parâmetros">
    <div className="parametersSidebarHeading workspacePanelHeader"><strong>{{flux:'Fluxo geral',transform:'Transformação afim',diagram:'Diagrama',reference:'Referência'}[activePanel]}</strong><button type="button" className="workspacePanelClose" onClick={()=>setSidebarOpen(false)} aria-label="Fechar controles"><TablerNavIcon name="close"/></button></div>
    <WorkspacePanelBody className="parametersSidebarBody" key={activePanel}>
     {activePanel==='flux'&&<>
      {['a','b'].map((prefix,i)=><details className="workspaceDisclosure" open key={prefix}><summary><span>Componente {i+1} · <MathLabel>{i===0?'f(u,v)':'g(u,v)'}</MathLabel></span></summary><div className="statePanelSectionBody"><div className="parametersCoefficients">{coefficientKeys.filter(k=>k.startsWith(prefix)).map(k=><label key={k}><MathLabel>{coefficientLatex(k)}</MathLabel><input type="number" aria-label={`Coeficiente ${k}`} step="any" value={p[k]} onChange={e=>setP({...p,[k]:Number(e.target.value)})}/></label>)}</div></div></details>)}
      <p className="parametersSidebarHint">Coeficientes compartilhados entre os ambientes.</p>
     </>}
     {activePanel==='transform'&&<>
      <details className="workspaceDisclosure" open><summary>Transformação afim</summary><div className="statePanelSectionBody"><p><MathLabel>{String.raw`U=AV+U_0,\quad\det A\ne0`}</MathLabel></p><fieldset className="workspaceControlGroup"><legend>Matriz <MathLabel>A</MathLabel> · mudança de base</legend><div className="parametersMatrix">{A.map((row,i)=>row.map((x,j)=><label key={`${i}${j}`}><MathLabel>{`A_{${i+1}${j+1}}`}</MathLabel><input aria-label={`Entrada A ${i+1}, ${j+1}`} type="number" step="any" value={x} onChange={e=>setMatrix(i,j,Number(e.target.value))}/></label>))}</div></fieldset><fieldset className="workspaceControlGroup"><legend>Vetor <MathLabel>{String.raw`U_0`}</MathLabel> · translação</legend><div className="parametersMatrix">{t.map((x,i)=><label key={i}><MathLabel>{`(U_0)_{${i+1}}`}</MathLabel><input aria-label={`Componente ${i+1} da translação`} type="number" step="any" value={x} onChange={e=>setT(old=>old.map((v,j)=>i===j?Number(e.target.value):v))}/></label>)}</div></fieldset><p><MathLabel>{String.raw`\det A`}</MathLabel>: {preview?preview.determinant.toPrecision(6):'não invertível'}</p><p className="parametersSidebarHint">Confira os coeficientes abaixo antes de aplicar ao fluxo compartilhado.</p><button className="parametersPrimaryAction" disabled={!preview} onClick={apply}>Aplicar transformação</button><button onClick={()=>{setA([[1,0],[0,1]]);setT([0,0])}}>Identidade</button>{error&&<p role="status">{error}</p>}</div></details>
      <details className="workspaceDisclosure"><summary>Prévia dos coeficientes</summary><div className="statePanelSectionBody">{preview?<div className="parametersCoefficients">{coefficientKeys.map(k=><span key={k}><MathLabel>{coefficientLatex(k)}</MathLabel>: {preview.coefficients[k].toPrecision(6)}</span>)}</div>:<p>Transformação não invertível.</p>}</div></details>
     </>}
     {activePanel==='diagram'&&<>
      <details className="workspaceDisclosure" open><summary>Eixos do mapa</summary><div className="statePanelSectionBody"><div className="parametersMatrix"><label>Eixo horizontal<select value={axes[0]} onChange={e=>selectAxis(0,e.target.value)}>{coefficientKeys.filter(k=>k!==axes[1]).map(k=><option key={k} value={k}>{coefficientText(k)}</option>)}</select></label><label>Eixo vertical<select value={axes[1]} onChange={e=>selectAxis(1,e.target.value)}>{coefficientKeys.filter(k=>k!==axes[0]).map(k=><option key={k} value={k}>{coefficientText(k)}</option>)}</select></label></div></div></details><details className="workspaceDisclosure" open><summary>Região de amostragem</summary><div className="statePanelSectionBody"><label>Raio da janela em cada eixo<input type="number" min="0.000001" step="any" value={span} onChange={e=>{const v=Number(e.target.value);if(Number.isFinite(v)&&v>0)setSpan(v);setInspectedCell(null)}}/></label><small>A janela se estende por esse valor para cada lado do centro.</small></div></details>
      <details className="workspaceDisclosure"><summary>Intervalos do mapa</summary><div className="statePanelSectionBody"><p>Centro: ({center.map(v=>Number(v).toPrecision(4)).join(', ')})</p><p>Intervalos: [{xMin.toPrecision(4)}, {xMax.toPrecision(4)}] × [{yMin.toPrecision(4)}, {yMax.toPrecision(4)}].</p><button type="button" onClick={()=>{setDiagramCenter(null);setInspectedCell(null)}}>Centralizar nos parâmetros atuais</button></div></details>
     </>}
     {activePanel==='reference'&&<>
      <details className="workspaceDisclosure" open><summary>Guardar e restaurar</summary><div className="statePanelSectionBody"><p>Guarde uma cópia antes de editar ou transformar. A referência fica disponível enquanto este ambiente permanecer aberto.</p><button type="button" className="parametersPrimaryAction" onClick={saveReference}>{original?'Substituir pela configuração atual':'Definir fluxo atual como referência'}</button><button type="button" disabled={!original} onClick={restoreReference}>Restaurar fluxo de referência</button>{referenceMessage&&<p role="status">{referenceMessage}</p>}</div></details>
      <details className="workspaceDisclosure" open><summary>Referência → fluxo atual</summary><div className="statePanelSectionBody">{original?<div className="parametersReferenceTable">{coefficientKeys.map(k=><div key={k} className={original[k]!==p[k]?'is-changed':''}><MathLabel>{coefficientLatex(k)}</MathLabel><span>{Number(original[k]).toPrecision(4)}</span><span aria-hidden="true">→</span><strong>{Number(p[k]).toPrecision(4)}</strong></div>)}</div>:<p>Nenhuma referência guardada. Use a ação acima para começar a comparação.</p>}</div></details>
     </>}
    </WorkspacePanelBody>
   </WorkspaceDrawer>}
   <main className="parametersMain" aria-label="Análise dos parâmetros">
    <section className="parametersPanel parametersDiagramPanel"><div className="parametersSectionHeading"><span className="parametersEyebrow">Mapa de parâmetros · <MathLabel>{String.raw`${coefficientLatex(axes[0])} \times ${coefficientLatex(axes[1])}`}</MathLabel></span><h2>Explore a geometria de <MathLabel>{String.raw`\Delta=0`}</MathLabel></h2></div><p>Varie dois coeficientes mantendo os outros oito fixos. Clique em uma célula para inspecionar.</p><div className="parameterDiagramLegend">{Object.entries(colors).map(([key,color])=><span key={key}><i style={{background:color}}/>{categoryLabels[key]}</span>)}</div><div className="parametersPlotToolbar"><div className="parametersPointLegend" aria-label="Identificação dos pontos"><span><i className="parametersPointLegendCurrent"/>Parâmetros atuais</span><span><i className="parametersPointLegendInspected"/>Ponto inspecionado</span></div><button className="parameterRecenterButton" type="button" title="Centralizar o mapa nos coeficientes atuais" onClick={()=>{setDiagramCenter(null);setInspectedCell(null)}}><TablerNavIcon name="point"/><span>Centralizar mapa</span></button></div><p className="parameterMapHint" id="parameter-map-help">Arraste para mover · use a roda para ampliar · clique para inspecionar · duplo clique para centralizar.</p><svg ref={mapRef} className={`parameterDiagram ${mapDragging?'is-dragging':''}`} tabIndex={0} aria-describedby="parameter-map-help" onPointerDown={startMapGesture} onPointerMove={dragMap} onPointerUp={endMapGesture} onPointerCancel={endMapGesture} onLostPointerCapture={endMapGesture} onKeyDown={mapKey} onDoubleClick={centerMapAtPointer} viewBox="0 0 440 440" role="img" aria-label={`Diagrama de classificação de Δ=0 nos parâmetros ${axes[0]} e ${axes[1]}`}>
      <g transform="translate(50 16)">
        <g shapeRendering="crispEdges">{diagram.map(cell=><rect key={`${cell.i}-${cell.j}`} x={cell.i*9} y={cell.j*9} width="9" height="9" fill={colors[cell.category]} stroke="none"><title>{`${coefficientText(axes[0])}=${cell.x.toPrecision(4)}, ${coefficientText(axes[1])}=${cell.y.toPrecision(4)}: ${cell.type}. Clique para inspecionar.`}</title></rect>)}</g>
        <g className="parameterMajorGrid" pointerEvents="none">{[.25,.5,.75].map(f=><g key={f}><path d={`M${369*f} 0V369`}/><path d={`M0 ${369*f}H369`}/></g>)}</g>
        <rect width="369" height="369" fill="none" stroke="#b5c9d5" strokeWidth="1" pointerEvents="none"/>
        {inspectedCell&&<g pointerEvents="none"><rect x={inspectedCell.i*9-1} y={inspectedCell.j*9-1} width="11" height="11" fill="none" stroke="#14252b" strokeWidth="5"/><rect x={inspectedCell.i*9-1} y={inspectedCell.j*9-1} width="11" height="11" fill="none" stroke="#fff" strokeWidth="2"/></g>}
        {p[axes[0]]>=xMin&&p[axes[0]]<=xMax&&p[axes[1]]>=yMin&&p[axes[1]]<=yMax&&<g transform={`translate(${(p[axes[0]]-xMin)/(xMax-xMin)*369} ${(yMax-p[axes[1]])/(yMax-yMin)*369})`} pointerEvents="none"><circle r="6" fill="none" stroke="#14252b" strokeWidth="5"/><circle r="6" fill="none" stroke="#fff" strokeWidth="2"/><circle r="1.5" fill="#fff"/></g>}
      </g>
      <g className="parameterAxisTicks" fill="currentColor" fontSize="10">{[0,.25,.5,.75,1].map(f=><g key={f}><path d={`M${50+369*f} 385v5M45 ${16+369*f}h5`} stroke="currentColor"/><text x={50+369*f} y="403" textAnchor="middle">{(xMin+(xMax-xMin)*f).toPrecision(3)}</text><text x="41" y={20+369*f} textAnchor="end">{(yMax-(yMax-yMin)*f).toPrecision(3)}</text></g>)}</g>
      <foreignObject x="194" y="411" width="80" height="28"><div className="parameterAxisLabel"><MathLabel>{coefficientLatex(axes[0])}</MathLabel></div></foreignObject>
      <g transform="translate(12 200) rotate(-90)"><foreignObject x="-40" y="-14" width="80" height="28"><div className="parameterAxisLabel"><MathLabel>{coefficientLatex(axes[1])}</MathLabel></div></foreignObject></g>
    </svg><small>As cores classificam a geometria de <MathLabel>{String.raw`\Delta=0`}</MathLabel>, não a hiperbolicidade de um estado. Mapa amostrado em <MathLabel>{String.raw`41\times41`}</MathLabel> células. Fronteiras e degenerações podem ser mais finas que a malha; cores indicam tipos de cônicas, não uma classificação completa de bifurcações do fluxo.</small></section>
    <div className="parametersAnalysisColumn">
    <section className="parametersPanel parametersInspectionPanel" aria-live="polite"><div className="parametersInspectionHeading"><h2>Ponto inspecionado no mapa</h2></div>{!inspectedCell?<p className="parametersInspectionHint">Clique em uma célula do mapa. Os valores e a classificação aparecem aqui antes de você decidir aplicá-los.</p>:<><div className="parametersInspectionValues"><div><small><MathLabel>{coefficientLatex(axes[0])}</MathLabel> · horizontal</small><strong>{inspectedCell.x.toPrecision(7)}</strong></div><div><small><MathLabel>{coefficientLatex(axes[1])}</MathLabel> · vertical</small><strong>{inspectedCell.y.toPrecision(7)}</strong></div></div><div className="parametersInspectionSummary"><div><span>Lugar <MathLabel>{String.raw`\Delta(u,v)=0`}</MathLabel></span><strong>{inspectedConic.type} — {inspectedConic.realLocus}</strong></div><div><span>Posto quadrático</span><strong>{inspectedConic.rank}</strong></div><div><span><MathLabel>{String.raw`\Delta(${sample.join(', ')})`}</MathLabel></span><strong>{Number.isFinite(inspectedDelta)?inspectedDelta.toPrecision(7):String(inspectedDelta)}</strong></div><div><span>Classificação local</span><strong>{classifyState(sample,inspectedFlux)}</strong></div></div><div className="parametersInspectionActions"><button className="parametersInspectionApply" type="button" onClick={applyInspectedCell}>Aplicar parâmetros inspecionados</button><button type="button" onClick={()=>setInspectedCell(null)}>Limpar seleção</button></div><small>Os outros oito coeficientes não mudam. Esta inspeção não certifica bifurcações dinâmicas.</small></>}</section>
    <section className="parametersPanel parametersClassificationPanel"><div className="parametersSectionHeading"><span className="parametersEyebrow">Fluxo atual</span><h2>Geometria de <MathLabel>{String.raw`\Delta=0`}</MathLabel></h2></div><p className="parametersConicResult"><strong>{conic.type}</strong><span>{conic.realLocus}</span></p><small>Classificação numérica com tolerância relativa de <MathLabel>{String.raw`10^{-9}`}</MathLabel>.</small><details className="workspaceSubsection"><summary>Expressão e detalhes da cônica</summary><div className="workspaceSubsectionBody"><div className="parametersEquation"><MathBlock>{deltaLatex}</MathBlock></div><p>Posto da parte quadrática: {conic.rank}; discriminante da parte quadrática: {conic.quadraticDiscriminant.toPrecision(6)}.</p>{conic.center&&<p>Centro: ({conic.center.map(x=>Number.isFinite(x)?x.toPrecision(6):String(x)).join(', ')}).</p>}<small>Perto de degenerações, confira com álgebra exata.</small></div></details></section>
    <ParameterClassification classification={currentClassification}/>
    {inspectedClassification&&<details className="parametersInspectedClassification"><summary>Estrato e direções do ponto inspecionado</summary><ParameterClassification classification={inspectedClassification} context="Ponto inspecionado"/></details>}
    <section className="parametersPanel parametersStateProbe"><div className="parametersSectionHeading"><span className="parametersEyebrow">Estado <MathLabel>{String.raw`(u,v)`}</MathLabel> · fluxo atual</span><h2>Testar hiperbolicidade</h2></div><p>Escolha um estado para avaliar <MathLabel>{String.raw`\Delta`}</MathLabel>. Estas coordenadas não são os eixos do mapa de parâmetros.</p><div className="parametersMatrix">{sample.map((x,i)=><label key={i}><MathLabel>{i?'v':'u'}</MathLabel><input aria-label={`Estado de teste ${i?'v':'u'}`} type="number" step="any" value={x} onChange={e=>setSample(old=>old.map((v,j)=>j===i?Number(e.target.value):v))}/></label>)}</div><div className="parametersProbeResult"><span><MathLabel>{String.raw`\Delta(${sample.join(', ')}) = ${latexNumber(discriminant(sample,p),7)}`}</MathLabel></span><strong>{classifyState(sample,p)}</strong></div><details className="workspaceSubsection"><summary>Como interpretar <MathLabel>{String.raw`\Delta`}</MathLabel></summary><div className="workspaceSubsectionBody"><span><MathLabel>{String.raw`\Delta>0`}</MathLabel> · hiperbólico estrito</span><span><MathLabel>{String.raw`\Delta=0`}</MathLabel> · parabólico</span><span><MathLabel>{String.raw`\Delta<0`}</MathLabel> · elíptico</span><small>A classificação de um estado é diferente do tipo geométrico do conjunto <MathLabel>{String.raw`\Delta=0`}</MathLabel>.</small></div></details></section></div>

   </main>
  </div>
 </div>
}

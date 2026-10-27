import {useMemo,useState} from 'react'
import TablerNavIcon from './TablerNavIcon.jsx'
import {coefficientKeys,transformQuadraticFlux,discriminantPolynomial,classifyState} from '../math/flux/affineClassification.js'
import {discriminant} from '../math/characteristic/spectrum.js'
import WorkspaceRail from './WorkspaceRail.jsx'
import WorkspaceDrawer from './WorkspaceDrawer.jsx'
import WorkspacePanelBody from './WorkspacePanelBody.jsx'
import { MathLabel, MathBlock } from './math/MathLabel.jsx'
import {classifyConic} from '../math/flux/conicClassification.js'
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
 const colors={compacto:'#56b68c',vazio:'#7d8796',hiperbólico:'#e8aa62',parabólico:'#77b9e9',retas:'#c79adf',degenerado:'#e17d88'}
 const categoryLabels={compacto:'Elipse / ponto',vazio:'Sem pontos reais',hiperbólico:'Hipérbole / retas concorrentes',parabólico:'Parábola',retas:'Retas paralelas / reta',degenerado:'Outras degenerações'}
 const center=diagramCenter??[Number(p[axes[0]])||0,Number(p[axes[1]])||0]
 const xMin=center[0]-span,xMax=center[0]+span,yMin=center[1]-span,yMax=center[1]+span
 const resolution=41
 const diagram=useMemo(()=>sampleParameterDiagram(p,axes[0],axes[1],xMin,xMax,yMin,yMax,resolution),[p,axes,xMin,xMax,yMin,yMax])
 const selectAxis=(index,value)=>{setAxes(old=>old.map((v,i)=>i===index?value:v));setDiagramCenter(null);setInspectedCell(null)}
 const inspectCell=cell=>{setDiagramCenter([...center]);setInspectedCell({x:cell.x,y:cell.y,i:cell.i,j:cell.j})}
 const applyInspectedCell=()=>{if(!inspectedCell)return;setP(old=>({...old,[axes[0]]:inspectedCell.x,[axes[1]]:inspectedCell.y}))}
 const inspectedFlux=useMemo(()=>inspectedCell?{...p,[axes[0]]:inspectedCell.x,[axes[1]]:inspectedCell.y}:null,[p,axes,inspectedCell])
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
    <section className="parametersPanel parametersDiagramPanel"><div className="parametersSectionHeading"><span className="parametersEyebrow">Mapa de parâmetros · <MathLabel>{String.raw`${coefficientLatex(axes[0])} \times ${coefficientLatex(axes[1])}`}</MathLabel></span><h2>Explore a geometria de <MathLabel>{String.raw`\Delta=0`}</MathLabel></h2></div><p>Varie dois coeficientes mantendo os outros oito fixos. Clique em uma célula para inspecionar.</p><div className="parameterDiagramLegend">{Object.entries(colors).map(([key,color])=><span key={key}><i style={{background:color}}/>{categoryLabels[key]}</span>)}</div><div className="parametersPointLegend" aria-label="Identificação dos pontos"><span><i className="parametersPointLegendCurrent"/>Parâmetros atuais</span><span><i className="parametersPointLegendInspected"/>Ponto inspecionado</span></div><svg className="parameterDiagram" viewBox="0 0 440 470" role="img" aria-label={`Diagrama de classificação de Δ=0 nos parâmetros ${axes[0]} e ${axes[1]}`}><g transform="translate(42 15)">{diagram.map(cell=><rect key={`${cell.i}-${cell.j}`} x={cell.i*9} y={cell.j*9} width="9.2" height="9.2" fill={colors[cell.category]} onClick={()=>inspectCell(cell)}><title>{`${coefficientText(axes[0])}=${cell.x.toPrecision(4)}, ${coefficientText(axes[1])}=${cell.y.toPrecision(4)}: ${cell.type}. Clique para inspecionar.`}</title></rect>)}{inspectedCell&&<rect x={inspectedCell.i*9} y={inspectedCell.j*9} width="9" height="9" fill="none" stroke="#fff" strokeWidth="2.4" pointerEvents="none"/>}<rect x="0" y="0" width="369" height="369" fill="none" stroke="currentColor" strokeWidth="1" pointerEvents="none"/><circle cx={(p[axes[0]]-xMin)/(xMax-xMin)*369} cy={(yMax-p[axes[1]])/(yMax-yMin)*369} r="5" fill="none" stroke="currentColor" strokeWidth="2" pointerEvents="none"/></g><g fill="currentColor" fontSize="12"><text x="42" y="400">{xMin.toPrecision(3)}</text><text x="411" y="400" textAnchor="end">{xMax.toPrecision(3)}</text><foreignObject x="186" y="407" width="80" height="28"><div className="parameterAxisLabel"><MathLabel>{coefficientLatex(axes[0])}</MathLabel></div></foreignObject><text x="34" y="20" textAnchor="end">{yMax.toPrecision(3)}</text><text x="34" y="385" textAnchor="end">{yMin.toPrecision(3)}</text><g transform="translate(16 220) rotate(-90)"><foreignObject x="-40" y="-14" width="80" height="28"><div className="parameterAxisLabel"><MathLabel>{coefficientLatex(axes[1])}</MathLabel></div></foreignObject></g></g></svg><div className="parametersDiagramActions"><button onClick={()=>{setDiagramCenter(null);setInspectedCell(null)}}>Centralizar nos parâmetros atuais</button></div><small>As cores classificam a geometria de <MathLabel>{String.raw`\Delta=0`}</MathLabel>, não a hiperbolicidade de um estado. Mapa amostrado em <MathLabel>{String.raw`41\times41`}</MathLabel> células. Fronteiras e degenerações podem ser mais finas que a malha; cores indicam tipos de cônicas, não uma classificação completa de bifurcações do fluxo.</small></section>
    <div className="parametersAnalysisColumn">
    <section className="parametersPanel parametersInspectionPanel" aria-live="polite"><div className="parametersInspectionHeading"><h2>Ponto inspecionado no mapa</h2></div>{!inspectedCell?<p className="parametersInspectionHint">Clique em uma célula do mapa. Os valores e a classificação aparecem aqui antes de você decidir aplicá-los.</p>:<><div className="parametersInspectionValues"><div><small><MathLabel>{coefficientLatex(axes[0])}</MathLabel> · horizontal</small><strong>{inspectedCell.x.toPrecision(7)}</strong></div><div><small><MathLabel>{coefficientLatex(axes[1])}</MathLabel> · vertical</small><strong>{inspectedCell.y.toPrecision(7)}</strong></div></div><div className="parametersInspectionSummary"><div><span>Lugar <MathLabel>{String.raw`\Delta(u,v)=0`}</MathLabel></span><strong>{inspectedConic.type} — {inspectedConic.realLocus}</strong></div><div><span>Posto quadrático</span><strong>{inspectedConic.rank}</strong></div><div><span><MathLabel>{String.raw`\Delta(${sample.join(', ')})`}</MathLabel></span><strong>{Number.isFinite(inspectedDelta)?inspectedDelta.toPrecision(7):String(inspectedDelta)}</strong></div><div><span>Classificação local</span><strong>{classifyState(sample,inspectedFlux)}</strong></div></div><div className="parametersInspectionActions"><button className="parametersInspectionApply" type="button" onClick={applyInspectedCell}>Aplicar parâmetros inspecionados</button><button type="button" onClick={()=>setInspectedCell(null)}>Limpar seleção</button></div><small>Os outros oito coeficientes não mudam. Esta inspeção não certifica bifurcações dinâmicas.</small></>}</section>
    <section className="parametersPanel parametersClassificationPanel"><div className="parametersSectionHeading"><span className="parametersEyebrow">Fluxo atual</span><h2>Geometria de <MathLabel>{String.raw`\Delta=0`}</MathLabel></h2></div><p className="parametersConicResult"><strong>{conic.type}</strong><span>{conic.realLocus}</span></p><small>Classificação numérica com tolerância relativa de <MathLabel>{String.raw`10^{-9}`}</MathLabel>.</small><details className="workspaceSubsection"><summary>Expressão e detalhes da cônica</summary><div className="workspaceSubsectionBody"><div className="parametersEquation"><MathBlock>{deltaLatex}</MathBlock></div><p>Posto da parte quadrática: {conic.rank}; discriminante da parte quadrática: {conic.quadraticDiscriminant.toPrecision(6)}.</p>{conic.center&&<p>Centro: ({conic.center.map(x=>Number.isFinite(x)?x.toPrecision(6):String(x)).join(', ')}).</p>}<small>Perto de degenerações, confira com álgebra exata.</small></div></details></section>
    <section className="parametersPanel parametersStateProbe"><div className="parametersSectionHeading"><span className="parametersEyebrow">Estado <MathLabel>{String.raw`(u,v)`}</MathLabel> · fluxo atual</span><h2>Testar hiperbolicidade</h2></div><p>Escolha um estado para avaliar <MathLabel>{String.raw`\Delta`}</MathLabel>. Estas coordenadas não são os eixos do mapa de parâmetros.</p><div className="parametersMatrix">{sample.map((x,i)=><label key={i}><MathLabel>{i?'v':'u'}</MathLabel><input aria-label={`Estado de teste ${i?'v':'u'}`} type="number" step="any" value={x} onChange={e=>setSample(old=>old.map((v,j)=>j===i?Number(e.target.value):v))}/></label>)}</div><div className="parametersProbeResult"><span><MathLabel>{String.raw`\Delta(${sample.join(', ')}) = ${latexNumber(discriminant(sample,p),7)}`}</MathLabel></span><strong>{classifyState(sample,p)}</strong></div><details className="workspaceSubsection"><summary>Como interpretar <MathLabel>{String.raw`\Delta`}</MathLabel></summary><div className="workspaceSubsectionBody"><span><MathLabel>{String.raw`\Delta>0`}</MathLabel> · hiperbólico estrito</span><span><MathLabel>{String.raw`\Delta=0`}</MathLabel> · parabólico</span><span><MathLabel>{String.raw`\Delta<0`}</MathLabel> · elíptico</span><small>A classificação de um estado é diferente do tipo geométrico do conjunto <MathLabel>{String.raw`\Delta=0`}</MathLabel>.</small></div></details></section></div>

   </main>
  </div>
 </div>
}

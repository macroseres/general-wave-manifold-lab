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

const coefficientLatex = (key) => String(key).replace(/^([ab])(\d)(\d)$/, (_, letter, i, j) => `${letter}_{${i}${j}}`)

export default function ParametersWorkspace({p,setP}){
 const [activePanel,setActivePanel]=useState('flux')
 const [sidebarOpen,setSidebarOpen]=useState(true)
 const [A,setA]=useState([[1,0],[0,1]])
 const [t,setT]=useState([0,0])
 const [sample,setSample]=useState([0,0])
 const [error,setError]=useState('')
 const [original,setOriginal]=useState(null)
 const [axes,setAxes]=useState(['a20','b20'])
 const [span,setSpan]=useState(2)
 const [diagramCenter,setDiagramCenter]=useState(null)
 const [inspectedCell,setInspectedCell]=useState(null)
 const colors={compacto:'#56b68c',vazio:'#7d8796',hiperbólico:'#e8aa62',parabólico:'#77b9e9',retas:'#c79adf',degenerado:'#e17d88'}
 const center=diagramCenter??[Number(p[axes[0]])||0,Number(p[axes[1]])||0]
 const xMin=center[0]-span,xMax=center[0]+span,yMin=center[1]-span,yMax=center[1]+span
 const resolution=41
 const diagram=useMemo(()=>sampleParameterDiagram(p,axes[0],axes[1],xMin,xMax,yMin,yMax,resolution),[p,axes,xMin,xMax,yMin,yMax])
 const selectAxis=(index,value)=>{setAxes(old=>old.map((v,i)=>i===index?value:v));setDiagramCenter(null);setInspectedCell(null)}
 const inspectCell=cell=>setInspectedCell({x:cell.x,y:cell.y,i:cell.i,j:cell.j})
 const applyInspectedCell=()=>{if(!inspectedCell)return;setP(old=>({...old,[axes[0]]:inspectedCell.x,[axes[1]]:inspectedCell.y}))}
 const inspectedFlux=useMemo(()=>inspectedCell?{...p,[axes[0]]:inspectedCell.x,[axes[1]]:inspectedCell.y}:null,[p,axes,inspectedCell])
 const inspectedConic=useMemo(()=>inspectedFlux?classifyConic(discriminantPolynomial(inspectedFlux)):null,[inspectedFlux])
 const inspectedDelta=inspectedFlux?discriminant(sample,inspectedFlux):null
 const polynomial=useMemo(()=>discriminantPolynomial(p),[p])
 const preview=useMemo(()=>{try{return transformQuadraticFlux(p,A,t)}catch{return null}},[p,A,t])
 const setMatrix=(i,j,v)=>setA(old=>old.map((r,k)=>k===i?r.map((x,l)=>l===j?v:x):r))
 const apply=()=>{try{const next=transformQuadraticFlux(p,A,t);setOriginal(old=>old??p);setP(next.coefficients);setA([[1,0],[0,1]]);setT([0,0]);setError('Transformação aplicada; termo constante removido (não afeta a lei de conservação).')}catch(e){setError(e.message)}}
 const q=polynomial
 const latexNumber=value=>{const n=Number(value);return Number.isFinite(n)?n.toPrecision(4):String(value)}
 const deltaLatex=String.raw`\Delta(u,v) = ` + [
  `${latexNumber(q.u2)}u^{2}`, `${latexNumber(q.uv)}uv`, `${latexNumber(q.v2)}v^{2}`,
  `${latexNumber(q.u)}u`, `${latexNumber(q.v)}v`, latexNumber(q.c)
 ].map((term,i)=>i===0?term:term.startsWith('-')?` - ${term.slice(1)}`:` + ${term}`).join('')
 const conic=useMemo(()=>classifyConic(polynomial),[polynomial])
 return <div className="parametersWorkspace parametersWorkspace--unified workspaceLayout workspaceLayout--parameters">
  <div className="parametersUnifiedLayout">
   <WorkspaceRail
    items={[{id:'settings',label:'Fluxo'},{id:'geometry',label:'Transformação'},{id:'charts',label:'Diagrama'},{id:'reference',label:'Referência'}]}
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
      <details className="workspaceDisclosure" open><summary>Coeficientes do fluxo</summary><div className="statePanelSectionBody"><p>Os coeficientes são compartilhados com Estados e Variedade.</p><div className="parametersCoefficients">{coefficientKeys.map(k=><label key={k}><MathLabel>{coefficientLatex(k)}</MathLabel><input type="number" step="any" value={p[k]} onChange={e=>setP({...p,[k]:Number(e.target.value)})}/></label>)}</div></div></details>
      <details className="workspaceDisclosure"><summary>Referência</summary><div className="statePanelSectionBody"><button type="button" onClick={()=>setOriginal(null)}>Definir como referência</button>{original&&<button type="button" onClick={()=>{setP(original);setOriginal(null);setError('Fluxo de referência restaurado.')}}>Restaurar fluxo de referência</button>}</div></details>
     </>}
     {activePanel==='transform'&&<>
      <details className="workspaceDisclosure" open><summary>Transformação afim</summary><div className="statePanelSectionBody"><p><MathLabel>{String.raw`U=AV+U_0,\quad\det A\ne0`}</MathLabel></p><div className="parametersMatrix">{A.map((row,i)=>row.map((x,j)=><label key={`${i}${j}`}>A{i+1}{j+1}<input type="number" step="any" value={x} onChange={e=>setMatrix(i,j,Number(e.target.value))}/></label>))}</div><div className="parametersMatrix">{t.map((x,i)=><label key={i}>U₀[{i+1}]<input type="number" step="any" value={x} onChange={e=>setT(old=>old.map((v,j)=>i===j?Number(e.target.value):v))}/></label>)}</div><p>det A: {preview?preview.determinant.toPrecision(6):'não invertível'}</p><button disabled={!preview} onClick={apply}>Aplicar transformação</button><button onClick={()=>{setA([[1,0],[0,1]]);setT([0,0])}}>Identidade</button>{error&&<p role="status">{error}</p>}</div></details>
      <details className="workspaceDisclosure"><summary>Coeficientes transformados</summary><div className="statePanelSectionBody">{preview?<div className="parametersCoefficients">{coefficientKeys.map(k=><span key={k}><MathLabel>{coefficientLatex(k)}</MathLabel>: {preview.coefficients[k].toPrecision(6)}</span>)}</div>:<p>Transformação não invertível.</p>}</div></details>
     </>}
     {activePanel==='diagram'&&<>
      <details className="workspaceDisclosure" open><summary>Eixos e amostragem</summary><div className="statePanelSectionBody"><div className="parametersMatrix"><label>Eixo horizontal<select value={axes[0]} onChange={e=>selectAxis(0,e.target.value)}>{coefficientKeys.filter(k=>k!==axes[1]).map(k=><option key={k} value={k}>{k}</option>)}</select></label><label>Eixo vertical<select value={axes[1]} onChange={e=>selectAxis(1,e.target.value)}>{coefficientKeys.filter(k=>k!==axes[0]).map(k=><option key={k} value={k}>{k}</option>)}</select></label><label>Semiamplitude<input type="number" min="0.000001" step="any" value={span} onChange={e=>{const v=Number(e.target.value);if(Number.isFinite(v)&&v>0)setSpan(v);setInspectedCell(null)}}/></label></div></div></details>
      <details className="workspaceDisclosure"><summary>Janela de visualização</summary><div className="statePanelSectionBody"><p>Centro: ({center.map(v=>Number(v).toPrecision(4)).join(', ')})</p><p>Intervalos: [{xMin.toPrecision(4)}, {xMax.toPrecision(4)}] × [{yMin.toPrecision(4)}, {yMax.toPrecision(4)}].</p><button type="button" onClick={()=>{setDiagramCenter(null);setInspectedCell(null)}}>Centralizar nos parâmetros atuais</button></div></details>
     </>}
     {activePanel==='reference'&&<>
      <details className="workspaceDisclosure" open><summary>Parâmetros de referência</summary><div className="statePanelSectionBody"><p>O fluxo de referência pode ser restaurado após uma transformação afim.</p><button type="button" onClick={()=>setOriginal(null)}>Definir fluxo atual como referência</button>{original&&<button type="button" onClick={()=>{setP(original);setOriginal(null);setError('Fluxo de referência restaurado.')}}>Restaurar fluxo de referência</button>}</div></details>
      <details className="workspaceDisclosure"><summary>Comparação</summary><div className="statePanelSectionBody">{original?<div className="parametersCoefficients">{coefficientKeys.map(k=><span key={k}><MathLabel>{coefficientLatex(k)}</MathLabel>: {Number(original[k]).toPrecision(5)} → {Number(p[k]).toPrecision(5)}</span>)}</div>:<p>Nenhum fluxo de referência anterior está armazenado.</p>}</div></details>
     </>}
    </WorkspacePanelBody>
   </WorkspaceDrawer>}
   <main className="parametersMain" aria-label="Análise dos parâmetros">
    <section className="parametersPanel parametersDiagramPanel"><h2>Diagrama no espaço de parâmetros</h2><p>Classificação do conjunto real <MathLabel>{String.raw`\Delta(u,v)=0`}</MathLabel> para dois coeficientes variáveis; os outros oito permanecem fixos. Clique no mapa para inspecionar; aplicar é uma ação separada.</p><div className="parameterDiagramLegend">{Object.entries(colors).map(([key,color])=><span key={key}><i style={{background:color}}/>{key}</span>)}</div><div className="parametersPointLegend" aria-label="Identificação dos pontos"><span><i className="parametersPointLegendCurrent"/>Parâmetros atuais</span><span><i className="parametersPointLegendInspected"/>Ponto inspecionado</span></div><svg className="parameterDiagram" viewBox="0 0 440 470" role="img" aria-label={`Diagrama de classificação de Δ=0 nos parâmetros ${axes[0]} e ${axes[1]}`}><g transform="translate(42 15)">{diagram.map(cell=><rect key={`${cell.i}-${cell.j}`} x={cell.i*9} y={cell.j*9} width="9.2" height="9.2" fill={colors[cell.category]} onClick={()=>inspectCell(cell)}><title>{`${axes[0]}=${cell.x.toPrecision(4)}, ${axes[1]}=${cell.y.toPrecision(4)}: ${cell.type}. Clique para inspecionar.`}</title></rect>)}{inspectedCell&&<rect x={inspectedCell.i*9} y={inspectedCell.j*9} width="9" height="9" fill="none" stroke="#fff" strokeWidth="2.4" pointerEvents="none"/>}<rect x="0" y="0" width="369" height="369" fill="none" stroke="currentColor" strokeWidth="1" pointerEvents="none"/><circle cx={(p[axes[0]]-xMin)/(xMax-xMin)*369} cy={(yMax-p[axes[1]])/(yMax-yMin)*369} r="5" fill="none" stroke="currentColor" strokeWidth="2" pointerEvents="none"/></g><g fill="currentColor" fontSize="12"><text x="42" y="400">{xMin.toPrecision(3)}</text><text x="411" y="400" textAnchor="end">{xMax.toPrecision(3)}</text><text x="226" y="420" textAnchor="middle">{axes[0]}</text><text x="34" y="20" textAnchor="end">{yMax.toPrecision(3)}</text><text x="34" y="385" textAnchor="end">{yMin.toPrecision(3)}</text><text x="16" y="230" transform="rotate(-90 16 230)" textAnchor="middle">{axes[1]}</text></g></svg><div className="parametersDiagramActions"><button onClick={()=>{setDiagramCenter(null);setInspectedCell(null)}}>Centralizar nos parâmetros atuais</button></div><small>Mapa amostrado em 41 × 41 células. Fronteiras e degenerações podem ser mais finas que a malha; cores indicam tipos de cônicas, não uma classificação completa de bifurcações do fluxo.</small></section>
    <div className="parametersAnalysisColumn"><section className="parametersPanel parametersClassificationPanel"><h2>Discriminante e classificação</h2><div className="parametersEquation"><MathBlock>{deltaLatex}</MathBlock></div><div className="parametersClassificationRules"><span><MathLabel>{String.raw`\Delta>0`}</MathLabel> hiperbólico estrito</span><span><MathLabel>{String.raw`\Delta=0`}</MathLabel> parabólico</span><span><MathLabel>{String.raw`\Delta<0`}</MathLabel> elíptico</span></div><h3>Classificação global de <MathLabel>{String.raw`\Delta=0`}</MathLabel></h3><p><strong>{conic.type}</strong> — {conic.realLocus}.</p><p>Posto da parte quadrática: {conic.rank}; discriminante da parte quadrática: {conic.quadraticDiscriminant.toPrecision(6)}.</p>{conic.center&&<p>Centro: ({conic.center.map(x=>Number.isFinite(x)?x.toPrecision(6):String(x)).join(', ')}).</p>}<small>A classificação é numérica, com tolerância relativa de 10⁻⁹; perto de degenerações, confira com álgebra exata.</small><div className="parametersMatrix">{sample.map((x,i)=><label key={i}>{i?'v':'u'}<input type="number" step="any" value={x} onChange={e=>setSample(old=>old.map((v,j)=>j===i?Number(e.target.value):v))}/></label>)}</div><p><MathLabel>{String.raw`\Delta`}</MathLabel>({sample.join(', ')}) = {discriminant(sample,p).toPrecision(7)}</p><p>Classificação: <strong>{classifyState(sample,p)}</strong></p><small>Esta etapa classifica estados e transforma coeficientes; os diagramas de bifurcação e a verificação geométrica de E serão integrados depois.</small></section>
    <section className="parametersPanel parametersInspectionPanel" aria-live="polite"><div className="parametersInspectionHeading"><h2>Inspeção do ponto</h2>{inspectedCell&&<button type="button" onClick={()=>setInspectedCell(null)}>Limpar seleção</button>}</div>{!inspectedCell?<p className="parametersInspectionHint">Selecione uma célula no diagrama para inspecionar sem modificar o fluxo.</p>:<><div className="parametersInspectionValues"><div><small><MathLabel>{String.raw`${axes[0]}`}</MathLabel> · horizontal</small><strong>{inspectedCell.x.toPrecision(7)}</strong></div><div><small><MathLabel>{String.raw`${axes[1]}`}</MathLabel> · vertical</small><strong>{inspectedCell.y.toPrecision(7)}</strong></div></div><div className="parametersInspectionSummary"><div><span>Lugar <MathLabel>{String.raw`\Delta(u,v)=0`}</MathLabel></span><strong>{inspectedConic.type} — {inspectedConic.realLocus}</strong></div><div><span>Posto quadrático</span><strong>{inspectedConic.rank}</strong></div><div><span><MathLabel>{String.raw`\Delta`}</MathLabel>({sample.join(', ')})</span><strong>{Number.isFinite(inspectedDelta)?inspectedDelta.toPrecision(7):String(inspectedDelta)}</strong></div><div><span>Classificação local</span><strong>{classifyState(sample,inspectedFlux)}</strong></div></div><button className="parametersInspectionApply" type="button" onClick={applyInspectedCell}>Aplicar parâmetros inspecionados</button><small>Os outros oito coeficientes não mudam. Esta inspeção não certifica bifurcações dinâmicas.</small></>}</section></div>
   </main>
  </div>
 </div>
}

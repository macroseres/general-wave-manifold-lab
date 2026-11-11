import SceneVisibilityRow from './SceneVisibilityRow.jsx'
import {slowWaveArcColors} from '../config/waveColors.js'
import {MathLabel} from './math/MathLabel.jsx'
import VisibilityEye from './VisibilityEye.jsx'

const points=[['left','U_L','Estado esquerdo','#ff9f0a'],['right','U_R','Estado direito','#30d158'],['fixed','U_*','Estado fixado','#8da5b5'],['middle','U_{M_i}','Estados intermediários','#bf5af2']]

export function StatePointVisibility({pointVisibility,onTogglePointVisibility}) {
  return <div className="sharedStateVisibility" role="group" aria-label="Pontos compartilhados entre painéis">{points.map(([id,tex,label,color])=><div className="stateVisibilityRow" key={id} style={{'--visibility-color':color}}><span className="stateSwitchCopy"><strong><MathLabel>{tex}</MathLabel></strong><small>{label} · 2D</small></span><VisibilityEye checked={pointVisibility[id]} onChange={()=>onTogglePointVisibility?.(id)} aria-label={label}/></div>)}</div>
}

function PointDisclosure({title,open=false,children}){
  return <details className="sidebarSection workspacePanelSection workspaceDisclosure" data-panel-category="points" open={open}>
    <summary>{title}</summary>
    <div className="sidebarSectionBody">{children}</div>
  </details>
}

export function HugoniotCharacteristicPointVisibility({showForwardFastCharacteristicPoint=false,setShowForwardFastCharacteristicPoint,showBackwardSlowCharacteristicPoint=false,setShowBackwardSlowCharacteristicPoint,showForwardCharacteristicPoint,setShowForwardCharacteristicPoint,showBackwardCharacteristicPoint,setShowBackwardCharacteristicPoint}){
  const rows=[['forward',String.raw`\mathcal H^{\mathrm{forw}}(U_L)\cap\mathcal C_s`,'Interseção forward lenta','#ff9f0a',showForwardCharacteristicPoint,setShowForwardCharacteristicPoint],
    ['backward',String.raw`\mathcal H^{\mathrm{back}}(U_R)\cap\mathcal C_f`,'Interseção backward rápida','#30d158',showBackwardCharacteristicPoint,setShowBackwardCharacteristicPoint],
    ['forward-fast',String.raw`\mathcal H^{\mathrm{forw}}(U_L)\cap\mathcal C_f`,'Interseção forward rápida','#ff9f0a',showForwardFastCharacteristicPoint,setShowForwardFastCharacteristicPoint],
    ['backward-slow',String.raw`\mathcal H^{\mathrm{back}}(U_R)\cap\mathcal C_s`,'Interseção backward lenta','#30d158',showBackwardSlowCharacteristicPoint,setShowBackwardSlowCharacteristicPoint]]
  return <PointDisclosure title="Interseções com a característica" open>
    {rows.map(([id,tex,label,color,checked,setChecked])=><div key={id} className="stateVisibilityRow" style={{'--visibility-color':color}}>
      <span className="stateSwitchCopy"><strong><MathLabel>{tex}</MathLabel></strong><small>{label}</small></span>
      <VisibilityEye checked={checked} onChange={event=>setChecked?.(event.target.checked)} aria-label={label}/>
    </div>)}
  </PointDisclosure>
}

export function StateHugoniotVisibility({showLeftRiemannHugoniot,setShowLeftRiemannHugoniot,showRightRiemannHugoniot,setShowRightRiemannHugoniot,showMinusStateFibre,setShowMinusStateFibre,showPlusStateFibre,setShowPlusStateFibre}) {
  const rows=[['U_L','forw','Hugoniot forward de U L',<>Curva em <MathLabel>{String.raw`\pi_+`}</MathLabel> · estado esquerdo</>,'#ff9f0a',showLeftRiemannHugoniot,setShowLeftRiemannHugoniot],['U_R','back','Hugoniot backward de U R',<>Curva em <MathLabel>{String.raw`\pi_-`}</MathLabel> · estado direito</>,'#30d158',showRightRiemannHugoniot,setShowRightRiemannHugoniot],['U_*','forw','Fibra forward de U estrela',<>Curva em <MathLabel>{String.raw`\pi_+`}</MathLabel> · estado fixado</>,'#5b91da',showMinusStateFibre,setShowMinusStateFibre],['U_*','back','Fibra backward de U estrela',<>Curva em <MathLabel>{String.raw`\pi_-`}</MathLabel> · estado fixado</>,'#51b98b',showPlusStateFibre,setShowPlusStateFibre]]
  return <div className="sharedStateVisibility" role="group" aria-label="Hugoniot sincronizadas no 2D e 3D">
    {['Estados de Riemann','Fibras do estado fixado'].map((title,i)=><fieldset className="workspaceControlGroup" key={title}>
      <legend>{title}</legend>
      {rows.slice(i*2,i*2+2).map(([state,direction,label,hint,color,checked,setChecked])=><div className="stateVisibilityRow" key={label} style={{'--visibility-color':color}}><span className="stateSwitchCopy"><strong><MathLabel>{String.raw`\mathcal H^{\mathrm{${direction}}}(${state})`}</MathLabel></strong><small>{hint}</small></span><VisibilityEye checked={checked} onChange={e=>setChecked?.(e.target.checked)} aria-label={label}/></div>)}
    </fieldset>)}
  </div>
}

export function SeededRarefactionVisibility({section='waves',showForwardShockArc,setShowForwardShockArc,slowArc,showNonlocalShock,setShowNonlocalShock,showSeededKs,setShowSeededKs,showFullPsRarefaction,setShowFullPsRarefaction,showLeftSeededRarefaction,setShowLeftSeededRarefaction,showRightSeededRarefaction,setShowRightSeededRarefaction}){
  return <fieldset className="workspaceControlGroup"><legend>{section==='curves'?<>Curvas integrais por <MathLabel>P_s</MathLabel> e <MathLabel>P_f</MathLabel></>:'Arcos da onda lenta' }</legend>
    {[["S_s","Choque local",slowWaveArcColors.localShock,showForwardShockArc,setShowForwardShockArc],
      [String.raw`\mathcal R_s(P_s\to\mathcal J)`,'Rarefação lenta até a inflexão',slowWaveArcColors.rarefaction,showLeftSeededRarefaction,setShowLeftSeededRarefaction],
      [String.raw`\mathcal K_s`,'Composta lenta',slowWaveArcColors.composite,showSeededKs,setShowSeededKs],
      [String.raw`\mathcal R(P_s)`,'Curva integral','#ffcf76',showFullPsRarefaction,setShowFullPsRarefaction],
      [String.raw`S_s^{\mathrm{nl}}`,'Choque não local',slowWaveArcColors.nonlocalShock,showNonlocalShock,setShowNonlocalShock],
      [String.raw`\mathcal R(P_f)`,'Rarefação rápida','#30d158',showRightSeededRarefaction,setShowRightSeededRarefaction]].filter(([,label])=>section==='curves'?['Curva integral','Rarefação rápida'].includes(label):!['Curva integral','Rarefação rápida'].includes(label)).map(([tex,label,color,checked,setChecked])=>
      <SceneVisibilityRow key={label} tex={tex} label={label} color={color} checked={checked} onChange={event=>setChecked(event.target.checked)}/>)}
    {section!=='curves'&&<small>A rarefação termina na primeira inflexão. A composta segue até o choque não local.</small>}
    {section!=='curves'&&slowArc&&<small role="status">{slowArc.complete?'Primeira inflexão atingida.':`Arco interrompido antes da inflexão (${({'window-limit':'limite da janela','step-limit':'limite de passos','characteristic-boundary':'fronteira característica','speed-stopped':'crescimento não verificado','integration-stopped':'parada do integrador'})[slowArc.status]??'refinamento inconclusivo'}).`} <MathLabel>{String.raw`\lambda_s`}</MathLabel> {slowArc.speeds[0].toPrecision(6)} → {slowArc.speeds.at(-1).toPrecision(6)}.</small>}
  </fieldset>
}


export function WaveJunctionPointVisibility({
  showMiddlePoint,setShowMiddlePoint,showSlowMiddlePoint,setShowSlowMiddlePoint,
  showRarefactionJoin,setShowRarefactionJoin,showInflectionJunction,setShowInflectionJunction,
  showKsDs,setShowKsDs,showFastInflectionJunction,setShowFastInflectionJunction,
  showBackwardMinusJunction,setShowBackwardMinusJunction,showFastMinus,setShowFastMinus,
  showFastPlus,setShowFastPlus,showReflectedMinus,setShowReflectedMinus,showReflectedPlus,setShowReflectedPlus,
}){
  const groups=[
    ['Construção intermediária',[
      ['P_M','Ponto intermediário na variedade','#ffffff',showMiddlePoint,setShowMiddlePoint],
      ['P_{M,s}','Fibra intermediária na onda lenta','#ffffff',showSlowMiddlePoint,setShowSlowMiddlePoint],
      ['P_{r,K}','Hugoniot forward na rarefação lenta','#ffcf70',showRarefactionJoin,setShowRarefactionJoin],
    ]],
    ['Junções da onda lenta',[
      [String.raw`\mathcal R_s\cap\mathcal J`,'Rarefação na inflexão','#ffffff',showInflectionJunction,setShowInflectionJunction],
      [String.raw`\mathcal K_s\cap\mathcal{DS}`,'Composta lenta na dupla sônica',slowWaveArcColors.composite,showKsDs,setShowKsDs],
    ]],
    ['Junções da onda rápida',[
      [String.raw`\mathcal R_f\cap\mathcal J`,'Rarefação na inflexão','#30d158',showFastInflectionJunction,setShowFastInflectionJunction],
      ['Q^-','Choque local na sônica negativa','#45ef81',showFastMinus,setShowFastMinus],
      ['Q^+','Composta com o choque não local','#45ef81',showFastPlus,setShowFastPlus],
    ]],
    ['Junções da onda rápida refletida',[
      [String.raw`(Q^-)^\dagger`,'Interseção sônica do choque local','#45ef81',showReflectedMinus,setShowReflectedMinus],
      [String.raw`(Q^+)^\dagger`,'Composta com o choque não local','#45ef81',showReflectedPlus,setShowReflectedPlus],
    ]],
    ['Interseções sônicas da Hugoniot',[
      [String.raw`\mathcal H^{\mathrm{back}}(U_R)\cap\mathcal S^-`,'Hugoniot backward na sônica negativa','#64d2ff',showBackwardMinusJunction,setShowBackwardMinusJunction],
    ]],
  ]
  return groups.map(([title,rows],index)=><PointDisclosure key={title} title={title} open={index===0}>
    {rows.map(([tex,label,color,checked,setChecked])=>
      <SceneVisibilityRow key={tex} tex={tex} label={label} color={color}
        checked={checked} onChange={event=>setChecked(event.target.checked)}/>)}
  </PointDisclosure>)
}


export function ForwardSonicPointVisibility({report,visibility,onChange,junction,defaultVisible=true}){
  const plus=report.sonicSide==='plus'
  return <PointDisclosure title={<MathLabel>{String.raw`\mathcal H^{\mathrm{forw}}(U_L)\cap\mathcal S^{${plus?'+':'-'}}`}</MathLabel>}>
    <small>{report.status==='missing-state'?<>Defina <MathLabel>U_L</MathLabel> no espaço de estados.</>:report.status==='non-isolated-sonic-set'?'Interseção não isolada; não enumerada como pontos.':`${report.points.length} interseção(ões) finita(s) verificada(s).`}</small>
    {report.points.map(q=>{const terminal=junction&&Math.hypot(q.tau-junction.tau,q.Y-junction.Y,q.zc-junction.zc)<1e-6;return <div key={q.id} className="stateVisibilityRow" style={{'--visibility-color':'#fbbf24'}}><span className="stateSwitchCopy"><strong><MathLabel>{`Q_{${q.index}}${plus?'^+':'^-'}`}</MathLabel></strong><small>{q.tangency?'Tangência':'Interseção'}{terminal?' · fim da composta':''}</small></span><VisibilityEye checked={visibility[q.id]??defaultVisible} onChange={event=>onChange(q.id,event.target.checked)} aria-label={`Interseção forward S ${plus?'mais':'menos'} ${q.index}`}/></div>})}
    {report.infinityCount>0&&<small>Também há interseção no infinito projetivo, sem marcador finito.</small>}
  </PointDisclosure>
}

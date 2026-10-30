import {MathLabel} from './math/MathLabel.jsx'
import VisibilityEye from './VisibilityEye.jsx'

const points=[['left','U_L','Estado esquerdo','#ff9f0a'],['right','U_R','Estado direito','#30d158'],['fixed','U_*','Estado fixado','#8da5b5'],['middle','U_{M_i}','Estados intermediários','#bf5af2']]

export function StatePointVisibility({pointVisibility,onTogglePointVisibility}) {
  return <div className="sharedStateVisibility" role="group" aria-label="Pontos compartilhados entre painéis">{points.map(([id,tex,label,color])=><div className="stateVisibilityRow" key={id} style={{'--visibility-color':color}}><span className="stateSwitchCopy"><strong><MathLabel>{tex}</MathLabel></strong><small>{label} · 2D</small></span><VisibilityEye checked={pointVisibility[id]} onChange={()=>onTogglePointVisibility?.(id)} aria-label={label}/></div>)}</div>
}

export function HugoniotCharacteristicPointVisibility({showForwardFastCharacteristicPoint=false,setShowForwardFastCharacteristicPoint,showBackwardSlowCharacteristicPoint=false,setShowBackwardSlowCharacteristicPoint,showForwardCharacteristicPoint,setShowForwardCharacteristicPoint,showBackwardCharacteristicPoint,setShowBackwardCharacteristicPoint}){
  const rows=[['forward',String.raw`\mathcal H^{\mathrm{forw}}(U_L)\cap\mathcal C_s`,'Interseção forward lenta','#ff9f0a',showForwardCharacteristicPoint,setShowForwardCharacteristicPoint],
    ['backward',String.raw`\mathcal H^{\mathrm{back}}(U_R)\cap\mathcal C_f`,'Interseção backward rápida','#30d158',showBackwardCharacteristicPoint,setShowBackwardCharacteristicPoint],
    ['forward-fast',String.raw`\mathcal H^{\mathrm{forw}}(U_L)\cap\mathcal C_f`,'Interseção forward rápida','#ff9f0a',showForwardFastCharacteristicPoint,setShowForwardFastCharacteristicPoint],
    ['backward-slow',String.raw`\mathcal H^{\mathrm{back}}(U_R)\cap\mathcal C_s`,'Interseção backward lenta','#30d158',showBackwardSlowCharacteristicPoint,setShowBackwardSlowCharacteristicPoint]]
  return <fieldset className="workspaceControlGroup"><legend>Interseções com a característica · 3D</legend>
    {rows.map(([id,tex,label,color,checked,setChecked])=><div key={id} className="stateVisibilityRow" style={{'--visibility-color':color}}>
      <span className="stateSwitchCopy"><strong><MathLabel>{tex}</MathLabel></strong><small>{label}</small></span>
      <VisibilityEye checked={checked} onChange={event=>setChecked?.(event.target.checked)} aria-label={label}/>
    </div>)}<small>Visibilidade dos pontos independente das curvas de Hugoniot.</small>
  </fieldset>
}

export function StateHugoniotVisibility({showLeftRiemannHugoniot,setShowLeftRiemannHugoniot,showRightRiemannHugoniot,setShowRightRiemannHugoniot,showMinusStateFibre,setShowMinusStateFibre,showPlusStateFibre,setShowPlusStateFibre}) {
  const rows=[['U_L','forw','Hugoniot forward de U L','Curva em π₊ · estado esquerdo','#ff9f0a',showLeftRiemannHugoniot,setShowLeftRiemannHugoniot],['U_R','back','Hugoniot backward de U R','Curva em π₋ · estado direito','#30d158',showRightRiemannHugoniot,setShowRightRiemannHugoniot],['U_*','forw','Fibra forward de U estrela','Curva em π₊ · estado fixado','#5b91da',showMinusStateFibre,setShowMinusStateFibre],['U_*','back','Fibra backward de U estrela','Curva em π₋ · estado fixado','#51b98b',showPlusStateFibre,setShowPlusStateFibre]]
  return <div className="sharedStateVisibility" role="group" aria-label="Hugoniot sincronizadas no 2D e 3D">
    {['Estados de Riemann','Fibras do estado fixado'].map((title,i)=><fieldset className="workspaceControlGroup" key={title}>
      <legend>{title}</legend>
      {rows.slice(i*2,i*2+2).map(([state,direction,label,hint,color,checked,setChecked])=><div className="stateVisibilityRow" key={label} style={{'--visibility-color':color}}><span className="stateSwitchCopy"><strong><MathLabel>{String.raw`\mathcal H^{\mathrm{${direction}}}(${state})`}</MathLabel></strong><small>{hint}</small></span><VisibilityEye checked={checked} onChange={e=>setChecked?.(e.target.checked)} aria-label={label}/></div>)}
    </fieldset>)}
    <small>Visibilidade compartilhada entre Estados e Variedade 3D.</small>
  </div>
}

export function SeededRarefactionVisibility({section='waves',slowArc,showNonlocalShock,setShowNonlocalShock,showSeededKs,setShowSeededKs,showFullPsRarefaction,setShowFullPsRarefaction,showLeftSeededRarefaction,setShowLeftSeededRarefaction,showRightSeededRarefaction,setShowRightSeededRarefaction}){
  return <fieldset className="workspaceControlGroup"><legend>{section==='curves'?'Curvas integrais por P_s e P_f':'Ondas pelos pontos de referência'}</legend>
    {[[String.raw`S_s^{\mathrm{nl}}`,'Choque não local após a composta','#fbbf24',showNonlocalShock,setShowNonlocalShock],
      [String.raw`\mathcal K_s`,'Composta lenta pela rarefação de P s','#c084fc',showSeededKs,setShowSeededKs],
      [String.raw`\mathcal R(P_s)`,'Curva integral por P s','#ffcf76',showFullPsRarefaction,setShowFullPsRarefaction],
      [String.raw`\mathcal R_s(P_s\to\mathcal J)`,'Rarefação por P s','#ff9f0a',showLeftSeededRarefaction,setShowLeftSeededRarefaction],
      [String.raw`\mathcal R(P_f)`,'Rarefação por P f','#30d158',showRightSeededRarefaction,setShowRightSeededRarefaction]].filter(([,label])=>section==='curves'?['Curva integral por P s','Rarefação por P f'].includes(label):!['Curva integral por P s','Rarefação por P f'].includes(label)).map(([tex,label,color,checked,setChecked])=>
      <div key={label} className="stateVisibilityRow" style={{'--visibility-color':color}}><span className="stateSwitchCopy"><strong><MathLabel>{tex}</MathLabel></strong><small>{label}</small></span><VisibilityEye checked={checked} onChange={event=>setChecked(event.target.checked)} aria-label={label}/></div>)}
    {section==='curves'?<small>Curvas integrais completas por P_s e P_f, nos dois sentidos.</small>:<small>Arco crescente de P_s até a inflexão, composta e choque não local com controles independentes.</small>}
    {section!=='curves'&&slowArc&&<small role="status">{slowArc.complete?'Primeira inflexão atingida.':`Arco interrompido antes da inflexão (${({'window-limit':'limite da janela','step-limit':'limite de passos','characteristic-boundary':'fronteira característica','speed-stopped':'crescimento não verificado','integration-stopped':'parada do integrador'})[slowArc.status]??'refinamento inconclusivo'}).`} λ_s: {slowArc.speeds[0].toPrecision(6)} → {slowArc.speeds.at(-1).toPrecision(6)}.</small>}
  </fieldset>
}


export function WaveJunctionPointVisibility({showFastInflectionJunction,setShowFastInflectionJunction,showBackwardMinusJunction,setShowBackwardMinusJunction,showInflectionJunction,setShowInflectionJunction,}){
  return <fieldset className="workspaceControlGroup"><legend>Junções das ondas · 3D</legend>
    {[[String.raw`\mathcal R_f\cap\mathcal J`,'Interseção da rarefação rápida com a inflexão','#30d158',showFastInflectionJunction,setShowFastInflectionJunction],
      [String.raw`\mathcal H^{\mathrm{back}}(U_R)\cap\mathcal S^-`,'Interseção da Hugoniot backward com S menos','#64d2ff',showBackwardMinusJunction,setShowBackwardMinusJunction],
      [String.raw`\mathcal R_s\cap\mathcal J`,'Junção da rarefação com a inflexão','#ffffff',showInflectionJunction,setShowInflectionJunction],
].map(([tex,label,color,checked,setChecked])=><div key={label} className="stateVisibilityRow" style={{'--visibility-color':color}}><span className="stateSwitchCopy"><strong><MathLabel>{tex}</MathLabel></strong><small>{label}</small></span><VisibilityEye checked={checked} onChange={event=>setChecked(event.target.checked)} aria-label={label}/></div>)}
    <small>Visibilidade independente das curvas de rarefação, composta e choque.</small>
  </fieldset>
}


export function ForwardSonicPointVisibility({report,visibility,onChange,junction}){
  const plus=report.sonicSide==='plus'
  return <fieldset className="workspaceControlGroup"><legend>Hugoniot forward ∩ {plus?'S⁺':'S⁻'}</legend>
    <small>{report.status==='missing-state'?'Defina U_L no espaço de estados.':report.status==='non-isolated-sonic-set'?'Interseção não isolada; não enumerada como pontos.':`${report.points.length} interseção(ões) finita(s) verificada(s).`}</small>
    {report.points.map(q=>{const terminal=junction&&Math.hypot(q.tau-junction.tau,q.Y-junction.Y,q.zc-junction.zc)<1e-6;return <div key={q.id} className="stateVisibilityRow" style={{'--visibility-color':'#fbbf24'}}><span className="stateSwitchCopy"><strong><MathLabel>{`Q_{${q.index}}${plus?'^+':'^-'}`}</MathLabel></strong><small>{q.tangency?'Tangência':'Interseção'}{terminal?' · fim da composta':''}</small></span><VisibilityEye checked={visibility[q.id]!==false} onChange={event=>onChange(q.id,event.target.checked)} aria-label={`Interseção forward S ${plus?'mais':'menos'} ${q.index}`}/></div>})}
    {report.infinityCount>0&&<small>Também há interseção no infinito projetivo, sem marcador finito.</small>}
  </fieldset>
}

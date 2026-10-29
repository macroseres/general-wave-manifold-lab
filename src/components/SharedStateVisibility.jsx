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

export function SeededRarefactionVisibility({slowArc,showSeededKs,setShowSeededKs,showFullPsRarefaction,setShowFullPsRarefaction,showLeftSeededRarefaction,setShowLeftSeededRarefaction,showRightSeededRarefaction,setShowRightSeededRarefaction}){
  return <fieldset className="workspaceControlGroup"><legend>Rarefações pelos pontos de referência</legend>
    {[[String.raw`\mathcal K_s`,'Composta lenta pela rarefação de P s','#c084fc',showSeededKs,setShowSeededKs],
      [String.raw`\mathcal R(P_s)`,'Curva integral por P s','#ffcf76',showFullPsRarefaction,setShowFullPsRarefaction],
      [String.raw`\mathcal R_s(P_s\to\mathcal J)`,'Rarefação por P s','#ff9f0a',showLeftSeededRarefaction,setShowLeftSeededRarefaction],
      [String.raw`\mathcal R(P_f)`,'Rarefação por P f','#30d158',showRightSeededRarefaction,setShowRightSeededRarefaction]].map(([tex,label,color,checked,setChecked])=>
      <div key={label} className="stateVisibilityRow" style={{'--visibility-color':color}}><span className="stateSwitchCopy"><strong><MathLabel>{tex}</MathLabel></strong><small>{label}</small></span><VisibilityEye checked={checked} onChange={event=>setChecked(event.target.checked)} aria-label={label}/></div>)}
    <small>Curvas integrais por P_s e P_f nos dois sentidos; arco crescente de P_s até a primeira inflexão com visibilidade independente.</small>
    {slowArc&&<small role="status">{slowArc.complete?'Primeira inflexão atingida.':`Arco interrompido antes da inflexão (${({'window-limit':'limite da janela','step-limit':'limite de passos','characteristic-boundary':'fronteira característica','speed-stopped':'crescimento não verificado','integration-stopped':'parada do integrador'})[slowArc.status]??'refinamento inconclusivo'}).`} λ_s: {slowArc.speeds[0].toPrecision(6)} → {slowArc.speeds.at(-1).toPrecision(6)}.</small>}
  </fieldset>
}

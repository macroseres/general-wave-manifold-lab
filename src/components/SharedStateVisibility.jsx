import {MathLabel} from './math/MathLabel.jsx'
import VisibilityEye from './VisibilityEye.jsx'

const points=[['left','U_L','Estado esquerdo','#ff9f0a'],['right','U_R','Estado direito','#30d158'],['fixed','U_*','Estado fixado','#8da5b5'],['middle','U_{M_i}','Estados intermediários','#bf5af2']]

export function StatePointVisibility({pointVisibility,onTogglePointVisibility}) {
  return <div className="sharedStateVisibility" role="group" aria-label="Pontos compartilhados entre painéis">{points.map(([id,tex,label,color])=><div className="stateVisibilityRow" key={id} style={{'--visibility-color':color}}><span className="stateSwitchCopy"><strong><MathLabel>{tex}</MathLabel></strong><small>{label} · 2D</small></span><VisibilityEye checked={pointVisibility[id]} onChange={()=>onTogglePointVisibility?.(id)} aria-label={label}/></div>)}</div>
}

export function HugoniotCharacteristicPointVisibility({showForwardCharacteristicPoint,setShowForwardCharacteristicPoint,showBackwardCharacteristicPoint,setShowBackwardCharacteristicPoint}){
  const rows=[['forward',String.raw`\mathcal H^{\mathrm{forw}}(U_L)\cap\mathcal C_s`,'Interseção forward lenta','#ff9f0a',showForwardCharacteristicPoint,setShowForwardCharacteristicPoint],
    ['backward',String.raw`\mathcal H^{\mathrm{back}}(U_R)\cap\mathcal C_f`,'Interseção backward rápida','#30d158',showBackwardCharacteristicPoint,setShowBackwardCharacteristicPoint]]
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

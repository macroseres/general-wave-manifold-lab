import {MathLabel} from './math/MathLabel.jsx'
import VisibilityEye from './VisibilityEye.jsx'

export default function SceneVisibilityRow({tex,label,color,checked,onChange,disabled}){
  return <div className="stateVisibilityRow" style={{'--visibility-color':color}}>
    <span className="stateSwitchCopy">
      {tex&&<strong><MathLabel>{tex}</MathLabel></strong>}
      <span className="sceneObjectName">{label}</span>
    </span>
    <VisibilityEye aria-label={label} checked={checked} onChange={onChange} disabled={disabled}/>
  </div>
}

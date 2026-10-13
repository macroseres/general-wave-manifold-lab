import {scientificPointStyle} from '../config/scientificMarkerRules.js'

/** SVG semantic marker. Does not infer a reference state from the active projection. */
export default function ScientificPointMarker({x, y, referenceState = null, pointType, verificationStatus = 'candidate', title}) {
  const style = scientificPointStyle({referenceState, pointType, verificationStatus})
  const {radius:r,color,shape,filled,dash} = style
  const common = {fill: filled ? color : '#0b1016', stroke: color, strokeWidth: 1.8, ...(dash ? {strokeDasharray: dash} : {})}
  return <g pointerEvents="visiblePainted" aria-label={title}>
    {shape === 'diamond'
      ? <polygon points={`${x},${y-r} ${x+r},${y} ${x},${y+r} ${x-r},${y}`} {...common}/>
      : <circle cx={x} cy={y} r={r} {...common}/>}
    {!filled && <circle cx={x} cy={y} r="1.3" fill={color}/>}
    {title && <title>{title}</title>}
  </g>
}

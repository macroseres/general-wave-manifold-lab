import {stateMarkerShape} from '../config/scientificMarkerRules.js'

/** Pure SVG primitive: never owns pointer events, state, or mathematical projection. */
export default function ScientificStateMarker({
  side, x, y, radius = 10, fill, stroke = 'currentColor',
  strokeWidth = 1.5, preview = false,
}) {
  const common = {
    fill, stroke, strokeWidth,
    ...(preview ? {strokeDasharray: '3 3'} : {}),
  }
  const shape = stateMarkerShape(side)
  if (shape === 'diamond') {
    return <polygon points={`${x},${y-radius} ${x+radius},${y} ${x},${y+radius} ${x-radius},${y}`} {...common}/>
  }
  return <circle cx={x} cy={y} r={radius} {...common}/>
}

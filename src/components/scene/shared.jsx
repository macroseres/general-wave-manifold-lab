import {Line as DreiLine} from '@react-three/drei'
import {finiteLinePaths} from '../../rendering/finiteLinePaths.js'

// No invalid coordinates are allowed to enter three-stdlib LineGeometry.
// Split at non-finite vertices instead of drawing a false connecting chord.
export function Line({points,segments=false,...props}) {
  const paths = finiteLinePaths(points,{segments})
  return <group>{paths.map((path,i)=><DreiLine key={i} points={path} {...props}/>)}</group>
}

export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x))

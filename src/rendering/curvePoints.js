/** Convert pure geometric points to renderer-ready tuples; no Three.js objects. */
export function curvePoints3D(points,coordinates='tauYzc',{yOffset=0}={}){
  if(coordinates==='xyz')return points.map(p=>[p.x,p.y+yOffset,p.z])
  if(coordinates==='tauYzc')return points.map(p=>[p.tau,p.Y+yOffset,p.zc])
  throw new RangeError(`Unsupported curve coordinate system: ${coordinates}`)
}

// Zoom along the camera-to-target ray, retaining the current orbit center.
// Invalid input returns null so callers leave the camera untouched.
export function zoomPositionAroundTarget(position,target={x:0,y:0,z:0},factor){
  if(!Number.isFinite(factor)||factor<=0)return null
  const axes=['x','y','z']
  if(!position||!target||!axes.every(axis=>Number.isFinite(position[axis])&&Number.isFinite(target[axis])))return null
  const next=Object.fromEntries(axes.map(axis=>[axis,target[axis]+(position[axis]-target[axis])*factor]))
  return axes.every(axis=>Number.isFinite(next[axis]))?next:null
}

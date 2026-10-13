/** Geometric hit-testing in SVG coordinates; identities remain explicit. */
export function pointSegmentDistance(point, a, b) {
  const dx=b[0]-a[0], dy=b[1]-a[1]
  const denom=dx*dx+dy*dy
  const t=denom>0?Math.max(0,Math.min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dy)/denom)):0
  return Math.hypot(point[0]-a[0]-t*dx,point[1]-a[1]-t*dy)
}
export function curveDistance(point,points){
  if(!points?.length)return Infinity
  if(points.length===1)return Math.hypot(point[0]-points[0][0],point[1]-points[0][1])
  let d=Infinity
  for(let i=1;i<points.length;i++)d=Math.min(d,pointSegmentDistance(point,points[i-1],points[i]))
  return d
}
/** All curves within tolerance, ordered deterministically by distance and identity. */
export function projectedCurveHits(point,curves,tolerance=11){
  return curves.map(curve=>({curve,distance:curveDistance(point,curve.screenPoints)}))
    .filter(hit=>hit.distance<=tolerance)
    .sort((a,b)=>a.distance-b.distance||a.curve.key.localeCompare(b.curve.key))
}
/** Clicking the same overlap repeatedly cycles distinct object identities. */
export function nextProjectedCurveHit(hits,previousKey){
  if(!hits.length)return null
  const i=hits.findIndex(hit=>hit.curve.key===previousKey)
  return hits[(i+1)%hits.length].curve.key
}

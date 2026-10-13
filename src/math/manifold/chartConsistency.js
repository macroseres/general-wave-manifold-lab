import { desingularizedRegularity } from './desingularizedRegularity.js'

/** Compare the same characteristic lift in both projective charts when possible.
 * Rank agreement is necessary for a chart-independent diagnosis, not a
 * certification that the geometric zero set is singular when rank < 2.
 */
export function compareCharacteristicCharts(U, direction, speed, p, tolerance=1e-8) {
  const [x,y]=direction
  if (![...U,x,y,speed].every(Number.isFinite) || Math.hypot(x,y)===0)
    return {status:'invalid',ranks:[]}
  const candidates=[]
  // Avoid ill-conditioned coordinates near the chart boundary.
  if(Math.abs(x)>1e-6*Math.hypot(x,y)) candidates.push(desingularizedRegularity(U,0,y/x,speed,p,'finite',tolerance))
  if(Math.abs(y)>1e-6*Math.hypot(x,y)) candidates.push(desingularizedRegularity(U,0,x/y,speed,p,'reciprocal',tolerance))
  const ranks=candidates.map(c=>c.rank)
  const onManifold=candidates.every(c=>c.onManifold)
  const status=!candidates.length?'invalid':!onManifold?'off-level':candidates.length===1?'single-chart':ranks[0]===ranks[1]?'consistent':'rank-disagreement'
  return {status,ranks,regular:candidates.length>0&&onManifold&&ranks.every(r=>r===2),charts:candidates.map(c=>c.chart)}
}

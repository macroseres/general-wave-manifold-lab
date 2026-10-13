/** Shared wave-manifold loci and their state-space projections.
 * A locus is sampled once in W and both pi_- and pi_+ consume its vertices.
 * Nonregular chart points split paths; never join across the projective boundary.
 */
import { characteristicMesh } from './characteristic/mesh.js'
import { doubleSonicGeometry, inflectionGeometry } from './sonic/surface.js'
import { waveState } from '../math/manifold/waveState.js'
import { zFromZc } from '../math/charts/zChart.js'

const finitePoint = q => Array.isArray(q) && q.length === 3 && q.every(Number.isFinite)
function splitProjection(points, side, p) {
  const result = []
  let segment = []
  const flush = () => { if (segment.length > 1) result.push(segment); segment = [] }
  for (const q of points) {
    const tau = Array.isArray(q) ? q[0] : q?.tau
    const Y = Array.isArray(q) ? q[1] : (q?.Y ?? 0)
    const zc = Array.isArray(q) ? q[2] : q?.zc
    if (![tau,Y,zc].every(Number.isFinite)) { flush(); continue }
    const z = zFromZc(zc)
    const state = Number.isFinite(z) ? waveState(tau,Y,z,p) : null
    const uv = state?.kind === 'regular' ? (side === 'minus' ? state.Um : state.Up) : null
    if (!uv || !uv.every(Number.isFinite)) { flush(); continue }
    segment.push({u:uv[0],v:uv[1]})
  }
  flush()
  return result
}
export function sharedProjectedLoci(p,{tauMin,tauMax,YMin,YMax}) {
  const boundary = characteristicMesh(p,tauMin,tauMax).boundary
  const coincidence = []
  for (let i=0;i+1<boundary.length;i+=2) {
    if (finitePoint(boundary[i]) && finitePoint(boundary[i+1])) coincidence.push([boundary[i],boundary[i+1]])
  }
  const ds = doubleSonicGeometry(p,{tauMin,tauMax,YMin,YMax}).map(x=>x.points).filter(Boolean)
  const j = inflectionGeometry(p,{tauMin,tauMax})
    .filter(path=>Array.isArray(path)&&path.length>=2)
    .map(path=>path.map(q=>({tau:q.tau,Y:0,zc:q.zc})))
  const definitions = [
    {id:'E',label:'ℰ',color:'#bc9cba',paths:coincidence},
    {id:'DS',label:'DS',color:'#8da5b5',paths:ds},
    {id:'J',label:'𝒥',color:'#8da5b5',paths:j},
  ]
  return definitions.map(item=>({ ...item, projected: {
    minus:item.paths.flatMap(path=>splitProjection(path,'minus',p)),
    plus:item.paths.flatMap(path=>splitProjection(path,'plus',p)),
  }}))
}

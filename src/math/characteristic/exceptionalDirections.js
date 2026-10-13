import { exceptionalFiberLimit } from './fiberLimits.js'

/** Locate finite projective directions where P=Q=R=0, plus z=infinity.
 * Candidates come from the lowest-degree nonzero coefficient polynomial;
 * each is checked by the existing projective fiber classifier.
 */
export function exceptionalDirections(p, tolerance = 1e-10) {
  const polys = [
    [-p.a11, p.b11 - 2*p.a20, 2*p.b20],
    [-2*p.a02, 2*p.b02 - p.a11, p.b11],
    [-p.a01, p.b01 - p.a10, p.b10],
  ]
  const scale = Math.max(1, ...polys.flat().map(Math.abs))
  const eps = tolerance * scale
  const degree = c => Math.abs(c[2]) > eps ? 2 : Math.abs(c[1]) > eps ? 1 : Math.abs(c[0]) > eps ? 0 : -1
  const hasConstantConstraint = polys.some(c=>degree(c)===0)
  const source = hasConstantConstraint ? null : polys.filter(c => degree(c) > 0).sort((a,b)=>degree(a)-degree(b))[0]
  const roots = []
  if (source) {
    const [c,b,a] = source
    if (degree(source) === 1) roots.push(-c/b)
    else {
      const disc = b*b-4*a*c
      if (disc >= -eps*eps) {
        const d = Math.sqrt(Math.max(0,disc))
        roots.push((-b+d)/(2*a),(-b-d)/(2*a))
      }
    }
  }
  const unique = roots.filter((z,i)=>Number.isFinite(z) && roots.findIndex(v=>Math.abs(v-z)<1e-8*Math.max(1,Math.abs(z)))===i)
  const directions = unique.map(z=>({z,...exceptionalFiberLimit(z,p,tolerance)})).filter(item=>item.kind==='degenerate')
  const infinity = exceptionalFiberLimit(Infinity,p,tolerance)
  if (infinity.kind==='degenerate') directions.push({z:Infinity,...infinity})
  return {directions, allDirectionsDegenerate:polys.every(c=>degree(c)===-1)}
}

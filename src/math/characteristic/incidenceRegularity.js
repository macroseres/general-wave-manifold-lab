import {jacobian} from '../flux/quadraticFlux.js'

/** Regularity of the reduced characteristic incidence q(U,[r])=det(r,DF(U)r)=0.
 * The projective direction is represented by a unit vector r=(x,y), so the
 * angular derivative is coordinate-independent and covers z=infinity.
 * This is NOT a certificate of regularity of the full wave manifold W.
 */
export function characteristicIncidenceRegularity(U,p,directions=[],tolerance=1e-10){
  if(!Array.isArray(U)||U.length!==2||!U.every(Number.isFinite))return []
  const [[a,b],[c,d]]=jacobian(U,p)
  const scale=Math.max(1,Math.abs(a),Math.abs(b),Math.abs(c),Math.abs(d),
    ...Object.values(p).filter(Number.isFinite).map(Math.abs))
  return directions.map(item=>{
    const [x,y]=item.direction
    const qu=2*p.b20*x*x+(p.b11-2*p.a20)*x*y-p.a11*y*y
    const qv=p.b11*x*x+(2*p.b02-p.a11)*x*y-2*p.a02*y*y
    const qtheta=(d-a)*(x*x-y*y)-2*(b+c)*x*y
    const gradientNorm=Math.hypot(qu,qv,qtheta)/scale
    const angularNorm=Math.abs(qtheta)/scale
    return {...item,incidenceGradientNorm:gradientNorm,
      incidenceRegularity:gradientNorm>tolerance?'regular':'degenerate',
      fixedStateIntersection:angularNorm>tolerance?'transverse':'non-transverse',
      fullWaveManifoldRegularity:'not-certified'}
  })
}

import {hopfAtlasAt} from '../../math/sonic/hopfAtlas.js'

/** Exact algebraic section of trace=0 for a quadratic flux.
 * At fixed zc, trace is affine in (tau,Y); determinant restricted to that
 * line is quadratic. The three determinant probes determine its coefficients.
 * This evaluator does not change the reciprocal-chart choice of hopfAtlasAt.
 */
export function analyticHopfSection(z,p,side){
  const h0=hopfAtlasAt(0,0,z,p,side)
  const ht=hopfAtlasAt(1,0,z,p,side)
  const hy=hopfAtlasAt(0,1,z,p,side)
  if([h0,ht,hy].some(h=>h.kind!=='regular'))return null
  const a=ht.trace-h0.trace,b=hy.trace-h0.trace,c=h0.trace
  if(![a,b,c].every(Number.isFinite)||Math.hypot(a,b)<1e-12)return null
  const useTau=Math.abs(a)>=Math.abs(b)
  const point=u=>{
    const tau=useTau?(-b*u-c)/a:u
    const Y=useTau?u:(-a*u-c)/b
    return [tau,Y,z]
  }
  const probes=[-1,0,1].map(u=>{
    const q=point(u)
    return hopfAtlasAt(q[0],q[1],z,p,side)
  })
  if(probes.some(h=>h.kind!=='regular'||!Number.isFinite(h.det)))return null
  const [dm,d0,dp]=probes.map(h=>h.det)
  const d2=(dp+dm-2*d0)/2,d1=(dp-dm)/2
  return {z,a,b,c,useTau,d0,d1,d2,point,
    determinant:u=>(d2*u+d1)*u+d0,
    roots(){
      if(Math.abs(d2)<1e-13)return Math.abs(d1)<1e-13?[]:[-d0/d1]
      const delta=d1*d1-4*d2*d0
      if(delta<0)return []
      const sq=Math.sqrt(delta)
      return [(-d1-sq)/(2*d2),(-d1+sq)/(2*d2)].filter(Number.isFinite).sort((x,y)=>x-y)
    },
  }
}

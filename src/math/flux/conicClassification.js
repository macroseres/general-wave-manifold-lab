import { discriminantPolynomial } from './affineClassification.js'

// Classification of the real zero set of a quadratic polynomial in two variables.
// A tolerance is relative to the coefficient scale; near bifurcations the result is numerical.
export function classifyConic(q, relativeTolerance = 1e-9) {
  const {u2, uv, v2, u, v, c} = q
  const scale = Math.max(1, ...Object.values(q).map(Math.abs))
  const eps = relativeTolerance * scale
  const a = u2, b = uv/2, d = v2
  const tr = a+d, delta = Math.hypot(a-d,2*b)
  const eigen = [(tr+delta)/2,(tr-delta)/2]
  const rank = eigen.filter(x=>Math.abs(x)>eps).length
  const det = a*d-b*b
  const quadraticDiscriminant = uv*uv-4*u2*v2
  const result = { rank, determinant:det, quadraticDiscriminant, eigenvalues:eigen, center:null, type:'', realLocus:'', warning: '' }
  const near = x=>Math.abs(x)<=eps
  if(rank===0){
    if(Math.hypot(u,v)>eps){result.type='reta';result.realLocus='uma reta'}
    else if(near(c)){result.type='identicamente nulo';result.realLocus='todo o plano'}
    else {result.type='constante não nula';result.realLocus='vazio'}
    return result
  }
  if(rank===2){
    const center=[(b*v-d*u)/(2*det),(b*u-a*v)/(2*det)]
    const level = c + (u*center[0]+v*center[1])/2
    const sign = Math.sign(eigen[0]); const definite = eigen[0]*eigen[1]>0
    result.center=center
    if(!definite){result.type=near(level)?'duas retas concorrentes':'hipérbole';result.realLocus=result.type}
    else if(near(level)){result.type='ponto isolado';result.realLocus='um ponto'}
    else if(sign*level<0){result.type='elipse';result.realLocus='elipse real'}
    else {result.type='elipse imaginária';result.realLocus='vazio'}
    return result
  }
  // Rank one: decompose the linear term into the image and kernel of Q.
  const lambda=Math.abs(eigen[0])>eps?eigen[0]:eigen[1]
  let direction
  if(Math.abs(b)>eps){direction=[lambda-d,b]}else{direction=Math.abs(a)>Math.abs(d)?[1,0]:[0,1]}
  const norm=Math.hypot(...direction);direction=direction.map(x=>x/norm)
  const kernel=[-direction[1],direction[0]]
  const linearImage=u*direction[0]+v*direction[1]
  const linearKernel=u*kernel[0]+v*kernel[1]
  if(Math.abs(linearKernel)>eps){result.type='parábola';result.realLocus='parábola real';return result}
  const level=c-linearImage*linearImage/(4*lambda)
  if(near(level)){result.type='reta dupla';result.realLocus='uma reta (multiplicidade dois)'}
  else if(lambda*level<0){result.type='duas retas paralelas';result.realLocus='duas retas reais'}
  else {result.type='retas paralelas imaginárias';result.realLocus='vazio'}
  return result
}

export function classifyFluxConic(p,tolerance){return classifyConic(discriminantPolynomial(p),tolerance)}

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


/**
 * Global sign regions of a real quadratic polynomial q(u,v).
 * This is an algebraic diagnosis of Delta, not a sampled plot or a
 * certification of the full ten-dimensional parameter stratification.
 * Near a degenerate stratum the floating-point tolerance is inconclusive.
 */
export function classifyQuadraticSigns(q, relativeTolerance = 1e-9) {
  const {u2, uv, v2, u, v, c} = q
  const scale = Math.max(1, ...Object.values(q).map(Math.abs))
  const eps = relativeTolerance * scale
  const a=u2, b=uv/2, d=v2
  const tr=a+d, gap=Math.hypot(a-d,2*b)
  // Recover the small eigenvalue from det(Q)/largeEigenvalue.
  // The direct subtraction (tr-gap)/2 can round a nonzero value to zero.
  const raw=[(tr+gap)/2,(tr-gap)/2]
  const large=Math.abs(raw[0])>=Math.abs(raw[1])?raw[0]:raw[1]
  const small=large===0?0:(a*d-b*b)/large
  const eigen=large===raw[0]?[large,small]:[small,large]
  const nonzero=eigen.filter(x=>Math.abs(x)>eps)
  const result=(positive,negative,zero,reason,ambiguous=false)=>({
    // Unknown is null, never silently promoted to a certified Boolean.
    positive:ambiguous?null:positive,
    negative:ambiguous?null:negative,
    zero:ambiguous?null:zero,
    strictlyHyperbolicEverywhere:ambiguous?null:positive&&!negative&&!zero,
    hyperbolicEverywhere:ambiguous?null:!negative,
    ellipticRegionExists:ambiguous?null:negative,
    coincidenceExists:ambiguous?null:zero,
    evidence:ambiguous?'numerically-inconclusive':'tolerance-based-algebraic',
    reason,
  })
  // A tiny eigenvalue can change the global sign at arbitrarily large states.
  const ambiguous=eigen.some(x=>x!==0&&Math.abs(x)<=eps)
  if(nonzero.length===0){
    // A suppressed affine coefficient changes the sign at sufficiently large
    // states, even when it is tiny compared with the constant term.
    const uncertainAffine=(u!==0||v!==0)&&Math.hypot(u,v)<=eps
    if(Math.hypot(u,v)>eps)return result(true,true,true,'nonconstant affine polynomial',ambiguous)
    if(Math.abs(c)<=eps)return result(false,false,true,'zero polynomial',ambiguous||uncertainAffine||c!==0)
    return result(c>0,c<0,false,'nonzero constant',ambiguous||uncertainAffine)
  }
  if(nonzero.length===2){
    if(eigen[0]*eigen[1]<0)return result(true,true,true,'indefinite quadratic form',ambiguous)
    const determinant=a*d-b*b
    const x=(b*v-d*u)/(2*determinant)
    const y=(b*u-a*v)/(2*determinant)
    const level=c+(u*x+v*y)/2
    const uncertain=Math.abs(level)<=eps&&level!==0
    if(eigen[0]>0){
      return result(true,level< -eps,Math.abs(level)<=eps||level< -eps,'positive definite quadratic part',ambiguous||uncertain)
    }
    return result(level>eps,true,Math.abs(level)<=eps||level>eps,'negative definite quadratic part',ambiguous||uncertain)
  }
  const lambda=Math.abs(eigen[0])>eps?eigen[0]:eigen[1]
  // Eigenvector chosen without division by a potentially tiny off-diagonal.
  const direction=Math.abs(b)>eps
    ? [lambda-d,b]
    : Math.abs(a)>=Math.abs(d)?[1,0]:[0,1]
  const norm=Math.hypot(...direction)
  const e=direction.map(x=>x/norm), k=[-e[1],e[0]]
  const linearKernel=u*k[0]+v*k[1]
  if(Math.abs(linearKernel)>eps)return result(true,true,true,'linear drift along null direction',ambiguous)
  // Any nonzero drift along the kernel makes q unbounded in both signs.
  // Suppressing it by tolerance cannot certify global nonnegativity.
  const uncertainKernel=linearKernel!==0
  const linearImage=u*e[0]+v*e[1]
  const level=c-linearImage*linearImage/(4*lambda)
  const uncertain=Math.abs(level)<=eps&&level!==0
  if(lambda>0)return result(true,level< -eps,Math.abs(level)<=eps||level< -eps,'rank-one positive quadratic part',ambiguous||uncertain||uncertainKernel)
  return result(level>eps,true,Math.abs(level)<=eps||level>eps,'rank-one negative quadratic part',ambiguous||uncertain||uncertainKernel)
}

export function classifyFluxSigns(p,tolerance) {
  return classifyQuadraticSigns(discriminantPolynomial(p),tolerance)
}

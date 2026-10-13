import {jacobian} from '../flux/quadraticFlux.js'

/** Exact homogeneous eigen-direction equation q(x,y)=det([r,DF(U)r]).
 * q=0 describes characteristic directions in RP¹. Its angular derivative
 * distinguishes simple and double roots of this algebraic equation, not
 * transversality of a potentially singular wave-manifold fibre.
 */
export function projectiveCharacteristicContact(U,p,directions=[],tolerance=1e-10){
  if(!Array.isArray(U)||U.length!==2||!U.every(Number.isFinite))return []
  const [[a,b],[c,d]]=jacobian(U,p)
  const scale=Math.max(1,Math.abs(a),Math.abs(b),Math.abs(c),Math.abs(d))
  return directions.map(item=>{
    const [x,y]=item.direction
    const value=c*x*x+(d-a)*x*y-b*y*y
    const dx=2*c*x+(d-a)*y,dy=(d-a)*x-2*b*y
    const angularDerivative=-y*dx+x*dy
    const normalizedResidual=Math.abs(value)/scale
    const normalizedDerivative=Math.abs(angularDerivative)/scale
    return {...item,projectiveResidual:normalizedResidual,
      projectiveDerivative:normalizedDerivative,
      projectiveContact:normalizedDerivative<=tolerance?'multiple':'simple',
      regularFibreContact:'not-certified'}
  })
}

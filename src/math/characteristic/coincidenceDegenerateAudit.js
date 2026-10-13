import { discriminantPolynomial } from '../flux/affineClassification.js'
import { classifyConic } from '../flux/conicClassification.js'
import { jacobian } from '../flux/quadraticFlux.js'

/** Detect isolated real zeros of the quadratic discriminant analytically.
 * This is distinct from sampling a sign-changing contour. Near-singular
 * coefficients are reported as uncertain rather than certified.
 */
export function auditCoincidenceDegeneracies(p, window, tolerance=1e-9) {
  const q=discriminantPolynomial(p)
  const classification=classifyConic(q,tolerance)
  const result={type:classification.type,isolatedPoints:[],warning:null}
  if(classification.type==='ponto isolado') {
    const center=classification.center
    if(center?.every(Number.isFinite)) {
      const [u,v]=center
      const inWindow=u>=window.uMin&&u<=window.uMax&&v>=window.vMin&&v<=window.vMax
      const J=jacobian([u,v],p)
      const scale=Math.max(1,...J.flat().map(Math.abs))
      const scalar=Math.abs(J[0][1])<=tolerance*scale&&Math.abs(J[1][0])<=tolerance*scale&&Math.abs(J[0][0]-J[1][1])<=tolerance*scale
      result.isolatedPoints.push({u,v,inWindow,kind:scalar?'matriz escalar':'autovalor duplo não escalar'})
    } else result.warning='Centro não finito: ponto isolado não localizado.'
  }
  if(['reta dupla','duas retas concorrentes','duas retas paralelas','identicamente nulo'].includes(classification.type)) {
    result.warning='Lugar parabólico degenerado: a amostragem de contorno pode omitir componentes sem troca de sinal.'
  }
  return result
}

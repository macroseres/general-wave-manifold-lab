import { jacobian } from '../flux/quadraticFlux.js'
import {projectiveCharacteristicContact} from './projectiveContact.js'
import {characteristicIncidenceRegularity} from './incidenceRegularity.js'

/** Projective characteristic directions at a fixed state, independent of mesh sampling.
 * Finite chart r=(z,1); reciprocal chart r=(1,Z), with infinity at Z=0.
 * This classifies the characteristic endpoints of the *closure* of each
 * Hugoniot fibre on the coincidence set. It does not certify regularity of
 * the wave-manifold lift or admissibility of a Riemann wave.
 */
export function classifyRiemannCharacteristicLifts(U, p, tolerance = 1e-10) {
  if (!Array.isArray(U) || U.length !== 2 || !U.every(Number.isFinite))
    return { kind: 'missing-state', directions: [] }
  const J = jacobian(U, p)
  const [[a,b],[c,d]] = J
  const trace = a+d
  const delta = (a-d)**2+4*b*c
  const scale = Math.max(1,Math.abs(a),Math.abs(b),Math.abs(c),Math.abs(d))
  const eps = tolerance*scale
  const discriminantTolerance = tolerance*scale*scale
  const scalar = Math.abs(a-d)<=eps && Math.abs(b)<=eps && Math.abs(c)<=eps
  if (scalar) return {kind:'scalar-degenerate',discriminant:delta,directions:[],eigenvalue:trace/2, note:'Todas as direções são autovetores; não há apenas dois levantamentos isolados.'}
  if (delta < -discriminantTolerance) return {kind:'elliptic',discriminant:delta,directions:[]}
  const repeated = Math.abs(delta)<=discriminantTolerance
  const roots = repeated?[trace/2]:[(trace-Math.sqrt(Math.max(0,delta)))/2,(trace+Math.sqrt(Math.max(0,delta)))/2]
  const directions = roots.map((lambda,i)=>{
    // Choose a numerically stronger row of (J-lambda I) and its perpendicular.
    const r1=[a-lambda,b],r2=[c,d-lambda]
    const row=Math.hypot(...r1)>=Math.hypot(...r2)?r1:r2
    let x=-row[1],y=row[0]
    if (Math.hypot(x,y)<=eps) {x=1;y=0}
    const norm=Math.hypot(x,y);x/=norm;y/=norm
    const infinity=Math.abs(y)<=eps
    const residual=Math.hypot((a-lambda)*x+b*y,c*x+(d-lambda)*y)
    return {branch:repeated?'coincidence':i===0?'slow':'fast',speed:lambda,
      chart:infinity?'reciprocal':'finite',...(infinity?{Z:0}:{z:x/y}),
      direction:[x,y],eigenResidual:residual}
  })
  return {kind:repeated?'repeated-defective':'strictly-hyperbolic',discriminant:delta,directions:characteristicIncidenceRegularity(U,p,projectiveCharacteristicContact(U,p,directions,tolerance),tolerance)}
}

/** The left and right roles differ by projection, not by characteristic spectrum. */
export function riemannCharacteristicIntersections(UL,UR,p) {
  return {
    forward:{projection:'minus',fixedState:UL, ...classifyRiemannCharacteristicLifts(UL,p)},
    backward:{projection:'plus',fixedState:UR, ...classifyRiemannCharacteristicLifts(UR,p)},
  }
}

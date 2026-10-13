import {flux} from '../flux/quadraticFlux.js'
import {stateCharacteristicDirection} from '../rarefaction/stateIntegralCurves.js'

const valid=U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)
const det=(a,b)=>a[0]*b[1]-a[1]*b[0]
const incidence=(fixed,U,p)=>det([U[0]-fixed[0],U[1]-fixed[1]],
  flux(U,p).map((x,i)=>x-flux(fixed,p)[i]))

/** Sampled transversality of a characteristic tangent and an RH incidence level set.
 * The angle indicator is |grad(D) dot tangent|/(|grad(D)| |tangent|).
 * Zero denotes tangency, one denotes orthogonal crossing. It is not a proof.
 */
export function mixedIntersectionTransversality(fixed,point,tangent,p,{gradientStep=1e-5,nearThreshold=0.04,residualTolerance=1e-7}={}){
  const unavailable=status=>({status,angleIndicator:null,entropyCertified:false})
  if(!valid(fixed)||!valid(point)||!valid(tangent)||!p||!(gradientStep>0))return unavailable('invalid-input')
  const residual=Math.abs(incidence(fixed,point,p))
  const scale=1+Math.hypot(...point)**3+Math.hypot(...fixed)**3
  if(!Number.isFinite(residual)||residual>residualTolerance*scale)return {...unavailable('off-hugoniot'),residual}
  const gradient=[0,1].map(i=>{
    const h=gradientStep*(1+Math.abs(point[i]))
    const plus=[...point],minus=[...point]
    plus[i]+=h;minus[i]-=h
    return (incidence(fixed,plus,p)-incidence(fixed,minus,p))/(2*h)
  })
  const norm=Math.hypot(...gradient)*Math.hypot(...tangent)
  if(!(norm>1e-12*scale)||!Number.isFinite(norm))return {...unavailable('degenerate-gradient-or-tangent'),residual,gradient}
  const indicator=Math.min(1,Math.abs(gradient[0]*tangent[0]+gradient[1]*tangent[1])/norm)
  return {status:indicator<=nearThreshold?'near-tangential-numerical':'transverse-numerical',angleIndicator:indicator,residual,gradient,entropyCertified:false}
}

/** Evaluate the same incidence transversality using the exact local characteristic
 * eigen-direction, avoiding a tangent inferred from a sampled chord.
 * The direction sign does not affect the absolute angle indicator.
 */
export function mixedCharacteristicTransversality(fixed,point,family,p,options={}){
  const characteristic=stateCharacteristicDirection(point,p,family)
  if(!characteristic)return {status:'characteristic-unavailable',angleIndicator:null,entropyCertified:false,tangentSource:'characteristic-field'}
  return {...mixedIntersectionTransversality(fixed,point,characteristic.direction,p,options),
    tangentSource:'characteristic-field',family,characteristicSpeed:characteristic.lambda,discriminant:characteristic.delta}
}

/** Angular discrepancy between the sampled chord and the local characteristic line.
 * The unoriented angle is in [0,pi/2]; it is a discretization diagnostic only.
 */
export function mixedCharacteristicChordError(point,chord,family,p,{nearThresholdDegrees=3}={}){
  const unavailable=status=>({status,angleRadians:null,angleDegrees:null,entropyCertified:false})
  if(!valid(point)||!valid(chord)||!p||!['slow','fast'].includes(family)||
    !(nearThresholdDegrees>=0&&nearThresholdDegrees<=90))return unavailable('invalid-input')
  const length=Math.hypot(...chord)
  if(!(length>1e-12))return unavailable('degenerate-chord')
  const characteristic=stateCharacteristicDirection(point,p,family)
  if(!characteristic)return unavailable('characteristic-unavailable')
  const direction=characteristic.direction
  const cosine=Math.min(1,Math.abs((chord[0]*direction[0]+chord[1]*direction[1])/length))
  const angleRadians=Math.acos(cosine)
  const angleDegrees=angleRadians*180/Math.PI
  return {status:angleDegrees<=nearThresholdDegrees?'aligned-numerical':'angular-discrepancy',
    angleRadians,angleDegrees,chordLength:length,family,characteristicSpeed:characteristic.lambda,
    entropyCertified:false}
}

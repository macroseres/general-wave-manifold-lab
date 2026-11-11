import {zChartCoefficients} from '../charts/zChart.js'
import {quadraticRoots} from '../numerics/polynomialRoots.js'
import {jacobian} from '../flux/quadraticFlux.js'
import {waveState} from '../manifold/waveState.js'
import {stateCharacteristicDirection} from '../rarefaction/stateIntegralCurves.js'
import {liftHugoniotSample} from '../state/hugoniotWaveLift.js'
import {stateFiberPoint} from '../state/fibers.js'

export function regularFibreInterval(start,end,p){
  const critical=quadraticRoots(6*p.b20,4*(p.b11-p.a20),2*(p.b02-p.a11))
    .filter(z=>z>Math.min(start,end)&&z<Math.max(start,end))
  const denominators=[start,...critical,end].map(z=>{
    const {P,Q}=zChartCoefficients(z,p)
    return P*z+Q
  })
  return denominators.every(d=>Number.isFinite(d)&&Math.abs(d)>1e-9&&Math.sign(d)===Math.sign(denominators[0]))
}

// On the fixed-left fibre, sigma(z)-sigma(end) is a cubic divided by
// z Q_2(z)-Q_1(z), where Q_i are the quadratic flux parts along (z,1).
// Dividing the numerator by (z-end) leaves a quadratic with known extrema.
export function forwardLiuOnFiniteFibre({from:fixed,to,family},p){
  const lift=liftHugoniotSample(fixed,to,p)
  if(lift.kind!=='regular')return null
  const end=lift.z
  const field=stateCharacteristicDirection(fixed,p,family)
  const other=stateCharacteristicDirection(fixed,p,family==='slow'?'fast':'slow')
  if(!field||!other)return null
  const start=field.direction[0]/field.direction[1]
  const otherRoot=other.direction[0]/other.direction[1]
  const lo=Math.min(start,end),hi=Math.max(start,end)
  if(!Number.isFinite(start)||start===end||(otherRoot>=lo&&otherRoot<=hi)||
    !regularFibreInterval(start,end,p))return null
  const target=stateFiberPoint(fixed,end,p,'minus')
  if(target.kind!=='regular')return null
  const speed=waveState(target.tau,target.Y,end,p).s
  if(!Number.isFinite(speed))return null
  const [[A,B],[C,D]]=jacobian(fixed,p)
  const cubic=(A-speed)*p.b20-C*p.a20
  const quadratic=(A-speed)*p.b11+B*p.b20-C*p.a11-(D-speed)*p.a20
  const linear=(A-speed)*p.b02+B*p.b11-C*p.a02-(D-speed)*p.a11
  const q1=quadratic+end*cubic,q0=linear+end*q1
  const vertex=-q1/(2*cubic)
  const probes=vertex>lo&&vertex<hi?[lo,vertex,hi]:[lo,hi]
  const sign=Math.sign(start-end)*Math.sign(target.denominator)
  const compatible=probes.every(z=>sign*((cubic*z+q1)*z+q0)>=0)
  return {status:compatible?'continuous-liu-compatible':'continuous-liu-violation',speed}
}

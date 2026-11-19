import {forwardSonicPolynomial} from '../state/forwardSonicIntersections.js'
import {stateFiberPoint} from '../../math/state/fibers.js'
import {zFromZc} from '../../math/charts/zChart.js'

function valueAndSlope(coefficients,z){
  let value=0,slope=0
  for(let i=coefficients.length-1;i>=0;i--){
    slope=slope*z+value
    value=value*z+coefficients[i]
  }
  return [value,slope]
}

/** On a regular forward fibre, right hysteresis satisfies Phi+ = dPhi+/dz = 0.
 * The cleared sonic polynomial and its derivative are affine in the fixed state.
 * Left hysteresis is obtained by exchanging the endpoints (Y -> -Y).
 */
export function hysteresisPaths(p,{tauMin,tauMax,YMin,YMax,samples=1600}){
  const constant=forwardSonicPolynomial([0,0],p,'plus')
  const coefficient=U=>forwardSonicPolynomial(U,p,'plus').map((value,i)=>value-constant[i])
  const first=coefficient([1,0]),second=coefficient([0,1])
  const plus=[],minus=[]
  let right=[],left=[],previous=null
  const flush=()=>{
    if(right.length>1)plus.push(right)
    if(left.length>1)minus.push(left)
    right=[];left=[];previous=null
  }
  for(let i=0;i<=samples;i++){
    const zc=-.999+1.998*i/samples,z=zFromZc(zc)
    const [C,dC]=valueAndSlope(constant,z)
    const [A,dA]=valueAndSlope(first,z),[B,dB]=valueAndSlope(second,z)
    const determinant=A*dB-B*dA
    if(Math.abs(determinant)<=1e-11*Math.max(1,Math.abs(A*dB),Math.abs(B*dA))){
      flush()
      continue
    }
    const U=[(B*dC-C*dB)/determinant,(C*dA-A*dC)/determinant]
    const point=stateFiberPoint(U,z,p,'minus')
    if(point.kind!=='regular'||![point.tau,point.Y].every(Number.isFinite)){
      flush()
      continue
    }
    if(previous&&(previous.determinant*determinant<0||previous.denominator*point.denominator<0))flush()
    previous={determinant,denominator:point.denominator}
    const {tau,Y}=point
    const inTau=tau>=tauMin&&tau<=tauMax
    if(inTau&&Y>=YMin&&Y<=YMax)right.push([tau,Y,zc])
    else {if(right.length>1)plus.push(right);right=[]}
    if(inTau&&-Y>=YMin&&-Y<=YMax)left.push([tau,-Y,zc])
    else {if(left.length>1)minus.push(left);left=[]}
  }
  flush()
  return {minus,plus}
}

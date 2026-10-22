import {readFileSync,writeFileSync} from 'node:fs'
import {pathToFileURL} from 'node:url'
import {stateFiberPoint,stateFiberPointReciprocal} from '../src/math/state/fibers.js'
import {waveState,rhResidual} from '../src/math/manifold/waveState.js'
import {directShockDiagnostic} from '../src/math/solution/directShockDiagnostic.js'

export const example=JSON.parse(readFileSync(new URL('../docs/examples/hugoniot-reference.json',import.meta.url),'utf8'))

export function buildHugoniotReference(){
  const {coefficients:p,left,right,selectedZ:z,plotZRange:[lo,hi]}=example
  const point=stateFiberPoint(left,z,p,'minus')
  const wave=waveState(point.tau,point.Y,z,p)
  const reciprocal=stateFiberPointReciprocal(left,1/z,p,'minus')
  const curve=Array.from({length:81},(_,i)=>{
    const direction=lo+(hi-lo)*i/80
    const q=stateFiberPoint(left,direction,p,'minus')
    const w=waveState(q.tau,q.Y,direction,p)
    return {z:direction,tau:q.tau,Y:q.Y,right:w.Up,speed:w.s,rhResidual:rhResidual(w,p)}
  })
  return {point,reciprocal,left:wave.Um,right:wave.Up,speed:wave.s,
    directDiagnostic:directShockDiagnostic(left,right,p),maxCurveResidual:Math.max(...curve.map(q=>q.rhResidual)),curve}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const result=buildHugoniotReference()
  if(process.argv[2]==='--json'){
    writeFileSync(new URL('../docs/examples/hugoniot-reference-results.json',import.meta.url),JSON.stringify(result,null,2)+'\n')
  }
  console.log(JSON.stringify({point:result.point,reciprocal:result.reciprocal,speed:result.speed,maxCurveResidual:result.maxCurveResidual},null,2))
}

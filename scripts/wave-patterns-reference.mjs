import {readFileSync,writeFileSync} from 'node:fs'
import {pathToFileURL} from 'node:url'
import {example as fluxExample} from './hugoniot-reference.mjs'
import {waveState} from '../src/math/manifold/waveState.js'
import {rarefactionField} from '../src/math/rarefaction/field.js'
import {rarefactionSolutionCandidate,rarefactionStateAtXi} from '../src/math/solution/rarefactionSolution.js'
import {twoShockSelfSimilarCandidate,evaluateSelfSimilarCandidate} from '../src/math/solution/riemannSelfSimilarCandidate.js'
import {assessTwoShockFamilyChain} from '../src/math/solution/twoShockFamilyEvidence.js'
import {liftHugoniotSample} from '../src/math/state/hugoniotWaveLift.js'

export const patterns=JSON.parse(readFileSync(new URL('../docs/examples/wave-patterns-reference.json',import.meta.url),'utf8'))
export const coefficients=fluxExample.coefficients

export function buildWavePatternsReference(){
  const {rarefaction:r,twoShock:c}=patterns,p=coefficients
  const curve=Array.from({length:r.samples},(_,i)=>{
    const u=i/(r.samples-1),tau=3/8-u,z=r.z
    const state=waveState(tau,0,z,p),field=rarefactionField(tau,z,p)
    return {u,v:state.Ubar[1],tau,Y:0,z,zc:2/Math.PI*Math.atan(z),speed:state.s,
      tauDot:field.tauDot,zDot:field.zDot,mapDet:field.mapDet}
  })
  const fan=rarefactionSolutionCandidate(curve,p)
  const profile=[-.5,0,.25,.5,.75,1,1.5].map(xi=>({xi,state:rarefactionStateAtXi(fan,xi)}))
  const chain=twoShockSelfSimilarCandidate(c.left,c.middle,c.right,p)
  return {rarefaction:{curve,fan,profile},twoShock:{...c,chain,
    evidence:assessTwoShockFamilyChain(c.left,c.middle,c.right,p),
    firstLift:liftHugoniotSample(c.left,c.middle,p),secondLift:liftHugoniotSample(c.middle,c.right,p),
    profile:[0,.5,.75,1,1.5].map(xi=>({xi,state:evaluateSelfSimilarCandidate(chain,xi)}))}}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const report=buildWavePatternsReference()
  if(process.argv[2]==='--json')writeFileSync(new URL('../docs/examples/wave-patterns-reference-results.json',import.meta.url),JSON.stringify(report,null,2)+'\n')
  console.log(JSON.stringify({fan:report.rarefaction.fan.kind,fanSpeedRange:[report.rarefaction.fan.xiMin,report.rarefaction.fan.xiMax],
    chain:report.twoShock.chain.status,speeds:report.twoShock.chain.speeds,firstLift:report.twoShock.firstLift.kind},null,2))
}

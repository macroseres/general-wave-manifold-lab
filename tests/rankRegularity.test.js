import test from 'node:test'
import assert from 'node:assert/strict'
import {numericalMatrixRank,rankineHugoniotRegularity} from '../src/math/manifold/rankRegularity.js'
import {oldWavePreset} from '../src/math/flux/quadraticFlux.js'
const p=oldWavePreset()
test('matrix rank detects dependent rows',()=>assert.equal(numericalMatrixRank([[1,2],[2,4]]),1))
test('ambient RH rank at zero jump cannot exceed one',()=>{
 const r=rankineHugoniotRegularity([0,0],0,1,0,p)
 assert.equal(r.rank,1);assert.equal(r.trivialJump,true);assert.equal(r.onRankineHugoniot,true)
})
test('generic nontrivial RH rank is two',()=>{
 const r=rankineHugoniotRegularity([1,2],1,0,0,p)
 assert.equal(r.rank,2);assert.equal(r.regularLevelSet,true)
})
test('RH differential matches finite differences',()=>{
 const args=[[.3,-.2],.8,.4,1.1]
 const base=rankineHugoniotRegularity(...args,p)
 const h=1e-6
 for(let j=0;j<5;j++){
  const evaluate=delta=>{const a=[[...args[0]],...args.slice(1)];if(j<2)a[0][j]+=delta;else a[j-1]+=delta;return rankineHugoniotRegularity(...a,p).residual}
  const plus=evaluate(h),minus=evaluate(-h)
  for(let i=0;i<2;i++)assert.ok(Math.abs((plus[i]-minus[i])/(2*h)-base.jacobian[i][j])<1e-6)
 }
})
test('forward and backward augmented ranks have valid bounds',()=>{
 const r=rankineHugoniotRegularity([1,2],1,0,0,p)
 assert.ok(r.forwardAugmentedRank>=r.rank&&r.forwardAugmentedRank<=4)
 assert.ok(r.backwardAugmentedRank>=r.rank&&r.backwardAugmentedRank<=4)
})

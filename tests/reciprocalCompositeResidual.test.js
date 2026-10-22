import test from 'node:test'
import assert from 'node:assert/strict'
import {reciprocalSonicImplicit} from '../src/math/sonic/reciprocalSonic.js'
import {sonicImplicit} from '../src/math/sonic/sonic.js'
import {oldWavePreset} from '../src/math/flux/quadraticFlux.js'
import {waveState} from '../src/math/manifold/waveState.js'
import {stateFiberPointReciprocal} from '../src/math/state/fibers.js'
import {certifyCompositePoint,compositeLeafIntersections} from '../src/math/state/compositeTrace.js'

test('reciprocal nontrivial sonic equation agrees with Z Phi on chart overlap',()=>{
  const p={...oldWavePreset(),b20:.3}
  for(const Z of [-.3,-.02,.02,.3])for(const side of ['minus','plus']){
    const value=reciprocalSonicImplicit(.2,.7,Z,p,side)
    const expected=Z*sonicImplicit(.2*Z*Z,.7*Z,1/Z,p,side)
    assert.ok(Math.abs(value-expected)<1e-9*(1+Math.abs(value)))
  }
})

test('reciprocal boundary no longer receives an artificial zero or certificate',()=>{
  const p={...oldWavePreset(),b20:.3},P=waveState(.3,0,.4,p)
  const q=stateFiberPointReciprocal(P.Um,0,p,'minus')
  assert.equal(q.kind,'regular')
  const value=reciprocalSonicImplicit(q.eta,q.Upsilon,0,p,'minus')
  assert.ok(Math.abs(value)>1)
  const c=certifyCompositePoint(P,{...q,chart:'reciprocal'},p,'minus')
  assert.equal(c.sonicSatisfied,false);assert.equal(c.valid,false)
  for(const root of compositeLeafIntersections(P,p,'minus',{samples:96,reciprocalSamples:64})){
    if(root.chart==='reciprocal')assert.ok(Math.abs(reciprocalSonicImplicit(root.eta,root.Upsilon,root.Z,p,'minus'))<=1e-9)
  }
})

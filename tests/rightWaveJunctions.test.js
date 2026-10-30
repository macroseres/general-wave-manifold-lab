import test from 'node:test'
import assert from 'node:assert/strict'
import {rightWaveJunctions} from '../src/geometry/state/rightWaveJunctions.js'
import {seededRarefactionCurves} from '../src/geometry/state/seededRarefactionCurves.js'
import {defaultCoefficients as p} from '../src/math/flux/quadraticFlux.js'
import {sonicData,sonicImplicit} from '../src/math/sonic/sonic.js'
import {waveState,rhResidual} from '../src/math/manifold/waveState.js'
import {characteristicSpectrum} from '../src/math/characteristic/spectrum.js'
import {zFromZc} from '../src/math/charts/zChart.js'

test('right markers satisfy fast inflection and backward S-minus membership independently',()=>{
  const U=[-.5,1],curve=seededRarefactionCurves({right:U},p,-2,2).find(q=>q.family==='fast'),data=rightWaveJunctions(curve,U,p)
  assert.ok(data.fastInflection.length)
  assert.ok(data.backwardMinus.length)
  for(const q of data.fastInflection){
    assert.equal(q.Y,0)
    assert.ok(Math.abs(sonicData(q.tau,zFromZc(q.zc),p).K)<1e-8)
    assert.equal(characteristicSpectrum(q.tau,zFromZc(q.zc),p).branch,'fast')
  }
  for(const q of data.backwardMinus){
    const z=zFromZc(q.zc),w=waveState(q.tau,q.Y,z,p)
    assert.ok(Math.abs(sonicImplicit(q.tau,q.Y,z,p,'minus'))<1e-8)
    assert.ok(Math.hypot(...w.Up.map((v,i)=>v-U[i]))<1e-8)
    assert.ok(Math.abs(q.Y)>1e-8)
    assert.ok(rhResidual(w,p)<1e-7)
  }
})
test('missing right state and curve do not fabricate junctions',()=>{
  assert.deepEqual(rightWaveJunctions(null,null,p),{fastInflection:[],backwardMinus:[]})
})

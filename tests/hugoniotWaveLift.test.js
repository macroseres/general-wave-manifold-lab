import test from 'node:test'
import assert from 'node:assert/strict'
import {waveState} from '../src/math/manifold/waveState.js'
import {liftHugoniotSample} from '../src/math/state/hugoniotWaveLift.js'

const p={a20:1.9,a11:0,a02:0.5,a10:0,a01:0,b20:0,b11:1,b02:-0.1,b10:1,b01:0}
test('reconstrói ponto regular a partir de extremos de salto',()=>{
  const w=waveState(0.35,0.6,0.4,p)
  assert.equal(w.kind,'regular')
  const lift=liftHugoniotSample(w.Um,w.Up,p)
  assert.equal(lift.kind,'regular')
  assert.ok(Math.abs(lift.tau-0.35)<1e-8)
  assert.ok(Math.abs(lift.Y-0.6)<1e-8)
  assert.ok(Math.abs(lift.z-0.4)<1e-8)
})
test('não cria ponto para salto nulo ou fora da carta',()=>{
 assert.equal(liftHugoniotSample([1,2],[1,2],p).kind,'coincidence')
 assert.equal(liftHugoniotSample([1,2],[2,2],p).kind,'outside-finite-z-chart')
})
test('recusa par de estados sem Rankine-Hugoniot',()=>{
 const lift=liftHugoniotSample([0,0],[1,1],p)
 assert.notEqual(lift.kind,'regular')
})

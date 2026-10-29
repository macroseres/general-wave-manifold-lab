import test from 'node:test'
import assert from 'node:assert/strict'
import {fibreCharacteristicMarkers} from '../src/geometry/state/fibreCharacteristicMarkers.js'
import {oldWavePreset} from '../src/math/flux/quadraticFlux.js'
import {waveState,eigenResidual} from '../src/math/manifold/waveState.js'
import {stateFiberPoint} from '../src/math/state/fibers.js'

test('forward and backward markers lie on the characteristic and both projection fibres',()=>{
  const p=oldWavePreset({B2:0})
  for(const U of [[.4895,-.3109],[.7063,.7984]]){
    const markers=fibreCharacteristicMarkers(U,p)
    assert.equal(markers.length,2)
    for(const q of markers){
      assert.deepEqual(q.position,[q.tau,0,q.zc])
      const state=waveState(q.tau,0,q.z,p)
      assert.ok(eigenResidual(state,p)<1e-8)
      for(const V of [state.Um,state.Up])assert.ok(Math.hypot(...V.map((v,i)=>v-U[i]))<1e-8)
      for(const side of ['minus','plus']){
        const fibre=stateFiberPoint(U,q.z,p,side)
        assert.ok(Math.abs(fibre.Y)<1e-8)
        assert.ok(Math.abs(fibre.tau-q.tau)<1e-8)
      }
    }
  }
})

test('missing, elliptic and nonrepresentable reciprocal points never create fake finite markers',()=>{
  const p=oldWavePreset({B2:0})
  assert.deepEqual(fibreCharacteristicMarkers(null,p),[])
  assert.deepEqual(fibreCharacteristicMarkers([0,-.5],p),[])
  const linear={a20:0,a11:0,a02:0,a10:1,a01:0,b20:0,b11:0,b02:0,b10:0,b01:2}
  assert.ok(fibreCharacteristicMarkers([1,1],linear).every(q=>q.position.every(Number.isFinite)))
})

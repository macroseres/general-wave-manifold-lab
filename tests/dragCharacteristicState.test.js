import test from 'node:test'
import assert from 'node:assert/strict'
import {dragCharacteristicState} from '../src/geometry/state/dragCharacteristicState.js'
import {selectedHugoniotCharacteristicMarkers} from '../src/geometry/state/fibreCharacteristicMarkers.js'
import {defaultCoefficients} from '../src/math/flux/quadraticFlux.js'
import {characteristicSpectrum} from '../src/math/characteristic/spectrum.js'
import {zFromZc} from '../src/math/charts/zChart.js'

const p=defaultCoefficients,bounds={tauMin:-2,tauMax:2}
test('dragged slow and fast markers project back to the updated left and right states',()=>{
  const states={left:[.5,-1],right:[.7063,.7984]},markers=selectedHugoniotCharacteristicMarkers(states,p)
  for(const [side,branch,start] of [['left','slow',markers.forward[0]],['right','fast',markers.backward[0]]]){
    const moved=dragCharacteristicState(start,{tau:start.tau+.08,zc:start.zc+.025},p,branch,bounds)
    assert.ok(moved)
    assert.equal(moved.point.Y,0)
    assert.equal(characteristicSpectrum(moved.point.tau,zFromZc(moved.point.zc),p).branch,branch)
    const updated=selectedHugoniotCharacteristicMarkers({...states,[side]:moved.state},p)
    const marker=(side==='left'?updated.forward:updated.backward)[0]
    assert.ok(Math.hypot(marker.tau-moved.point.tau,marker.zc-moved.point.zc)<1e-8)
    assert.ok(Math.hypot(marker.tau-start.tau,marker.zc-start.zc)>1e-5)
  }
})
test('drag stops before crossing the characteristic component boundary and rejects invalid targets',()=>{
  const start=selectedHugoniotCharacteristicMarkers({left:[.5,-1]},p).forward[0]
  for(const target of [{tau:-2,zc:0},{tau:100,zc:2},{tau:-100,zc:-2}]){
    const result=dragCharacteristicState(start,target,p,'slow',bounds)
    assert.ok(result)
    assert.equal(characteristicSpectrum(result.point.tau,zFromZc(result.point.zc),p).branch,'slow')
    assert.ok(Math.abs(result.point.zc)<=.996&&Math.abs(result.point.tau)<=2)
  }
  assert.equal(dragCharacteristicState(start,{tau:NaN,zc:0},p,'slow',bounds),null)
})


test('unbounded characteristic dragging can continue beyond the sampled surface tau window',()=>{
  const start=selectedHugoniotCharacteristicMarkers({left:[.5,-1]},p).forward[0]
  const moved=dragCharacteristicState(start,{tau:1.5,zc:start.zc},p,'slow',{tauMin:-Infinity,tauMax:Infinity})
  assert.ok(moved.point.tau>1)
  assert.equal(characteristicSpectrum(moved.point.tau,zFromZc(moved.point.zc),p).branch,'slow')
})

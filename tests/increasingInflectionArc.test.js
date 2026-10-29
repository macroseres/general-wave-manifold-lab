import test from 'node:test'
import assert from 'node:assert/strict'
import {increasingInflectionArc} from '../src/math/rarefaction/increasingInflectionArc.js'
import {selectedHugoniotCharacteristicMarkers} from '../src/geometry/state/fibreCharacteristicMarkers.js'
import {oldWavePreset} from '../src/math/flux/quadraticFlux.js'
import {inflectionResidual} from '../src/math/sonic/intersections.js'
import {sonicData} from '../src/math/sonic/sonic.js'
import {zFromZc} from '../src/math/charts/zChart.js'

const p=oldWavePreset({B2:0})
const seedFor=left=>selectedHugoniotCharacteristicMarkers({left},p).forward[0]

test('slow rarefaction starts at Ps, increases speed and stops at the first refined inflection',()=>{
  for(const left of [[.4895,-.3109],[.5,-1]]){
    const seed=seedFor(left),arc=increasingInflectionArc(seed,p,-2,2)
    assert.equal(arc.status,'inflection-reached')
    assert.equal(arc.complete,true)
    assert.deepEqual(arc.points[0],{tau:seed.tau,zc:seed.zc})
    assert.ok(arc.speeds.every((s,i)=>i===0||s>arc.speeds[i-1]))
    const last=arc.points.at(-1)
    assert.ok(inflectionResidual(last.tau,zFromZc(last.zc),p)<1e-9)
    const initialK=sonicData(seed.tau,zFromZc(seed.zc),p).K
    assert.ok(arc.points.slice(0,-1).every(q=>sonicData(q.tau,zFromZc(q.zc),p).K*initialK>0))
    const refined=increasingInflectionArc(seed,p,-2,2,{step:.0045})
    assert.equal(refined.status,'inflection-reached')
    assert.ok(Math.hypot(last.tau-refined.points.at(-1).tau,last.zc-refined.points.at(-1).zc)<1e-7)
  }
  assert.equal(increasingInflectionArc(seedFor([.5,-1]),p,-2,2).timeDirection,-1)
})

test('bounded or singular traces do not claim that inflection was reached',()=>{
  const seed=seedFor([.4895,-.3109])
  const bounded=increasingInflectionArc(seed,p,seed.tau-.00001,seed.tau+.00001)
  assert.equal(bounded.status,'window-limit')
  assert.equal(bounded.complete,false)
  const arc=increasingInflectionArc(seed,p,-2,2)
  const atJ=increasingInflectionArc(arc.points.at(-1),p,-2,2)
  assert.equal(atJ.status,'seed-on-inflection')
  assert.equal(atJ.points.length,1)
  assert.equal(increasingInflectionArc({tau:NaN,zc:0},p,-2,2).status,'invalid-seed')
})

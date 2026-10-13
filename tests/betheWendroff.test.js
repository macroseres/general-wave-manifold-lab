import test from 'node:test'
import assert from 'node:assert/strict'
import {betheWendroffData} from '../src/math/sonic/betheWendroff.js'
import {defaultCoefficients} from '../src/math/flux/quadraticFlux.js'
import {partitionSonicMesh} from '../src/geometry/sonic/spectralPartition.js'

test('discriminant identity is computed consistently on both state projections',()=>{
  for(const side of ['minus','plus']){
    const q=betheWendroffData(.2,.1,.3,defaultCoefficients,side)
    assert.equal(q.kind,'regular')
    assert.ok(Math.abs(q.discriminant-(q.trace*q.trace-4*q.det))<1e-10)
    assert.equal(q.gap,-q.trace)
  }
})
test('BT extraction preserves finite line segments',()=>{
  const mesh={positions:Float32Array.from([-.2,.1,-.4,.2,.1,-.4,0,.1,.4]),indices:Uint32Array.from([0,1,2])}
  for(const side of ['minus','plus']){
    const out=partitionSonicMesh(mesh,defaultCoefficients,side)
    assert.ok(out.bt.every(seg=>seg.length===2&&seg.every(q=>q.length===3&&q.every(Number.isFinite))))
  }
})

import test from 'node:test'
import assert from 'node:assert/strict'
import {hopfSurfaceMesh} from '../src/geometry/hopf/surface.js'
const p={a20:1.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
const opts={tauMin:-1,tauMax:1,YMin:-6,YMax:6,nTau:12,nZ:18,side:'minus'}
test('instrumentation conserves candidate counts',()=>{
  const {diagnostics:d}=hopfSurfaceMesh(p,{...opts,diagnostics:true})
  assert.equal(d.candidates.total,2*opts.nTau*opts.nZ)
  assert.equal(d.candidates.accepted+d.candidates.rejected,d.candidates.total)
  assert.equal(Object.values(d.reasons).reduce((a,b)=>a+b,0),d.candidates.rejected)
  assert.equal(Object.values(d.slices).filter(v=>typeof v==='number').slice(1).reduce((a,b)=>a+b,0),d.slices.total)
})
test('instrumentation does not change emitted geometry',()=>{
  const plain=hopfSurfaceMesh(p,opts)
  const instrumented=hopfSurfaceMesh(p,{...opts,diagnostics:true})
  assert.deepEqual(instrumented.positions,plain.positions)
  assert.deepEqual(instrumented.indices,plain.indices)
  assert.equal('diagnostics' in plain,false)
})

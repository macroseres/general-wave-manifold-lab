import test from 'node:test'
import assert from 'node:assert/strict'
import {embedReciprocalHopfPoint,embedReciprocalHopfMesh} from '../src/geometry/hopf/reciprocalEmbedding.js'
import {reciprocalHopfSurfaceMesh} from '../src/geometry/hopf/reciprocalSurface.js'
import {toReciprocal} from '../src/math/charts/reciprocalTransition.js'
import {waveState} from '../src/math/manifold/waveState.js'
const p={a20:1.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
test('embedding in R4 is finite at reciprocal projective boundary Z=0',()=>{
 for(const side of ['minus','plus']){
  const h=embedReciprocalHopfPoint(0,0,0,p,side)
  assert.equal(h.kind,'regular');assert.equal(h.coordinates[3],0);assert.ok(h.coordinates.every(Number.isFinite))
 }
})
test('R4 embedding preserves mean state and amplitude on overlap',()=>{
 const w=waveState(0.1,0.2,2,p);assert.equal(w.kind,'regular')
 const q=toReciprocal(0.1,0.2,2,p);assert.equal(q.kind,'regular')
 const h=embedReciprocalHopfPoint(q.free,q.X,q.Z,p,'minus');assert.equal(h.kind,'regular')
 assert.ok(Math.hypot(h.coordinates[0]-w.Ubar[0],h.coordinates[1]-w.Ubar[1])<1e-7)
 assert.ok(Math.abs(h.coordinates[2]-0.4)<1e-10)
})
test('embedded reciprocal mesh keeps vertex and triangle topology',()=>{
 const m=reciprocalHopfSurfaceMesh(p,{side:'minus',nZ:12,nLine:8})
 assert.equal(m.kind,'regular')
 const e=embedReciprocalHopfMesh(m,p)
 assert.equal(e.kind,'regular');assert.equal(e.positions4.length,m.positions.length/3*4)
 assert.deepEqual(e.indices,m.indices);assert.ok(e.positions4.every(Number.isFinite))
})

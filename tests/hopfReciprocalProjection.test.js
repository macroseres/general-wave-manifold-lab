import test from 'node:test'
import assert from 'node:assert/strict'
import {projectReciprocalHopfPoint,projectReciprocalHopfMesh} from '../src/geometry/hopf/reciprocalProjection.js'
import {reciprocalHopfSurfaceMesh} from '../src/geometry/hopf/reciprocalSurface.js'
const p={a20:1.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
test('two diagnostic projections preserve reciprocal boundary Z=0',()=>{
 for(const side of ['minus','plus'])for(const view of ['state-amplitude','state-direction']){
  const h=projectReciprocalHopfPoint(0,.25,0,p,side,{view})
  assert.equal(h.kind,'regular');assert.equal(h.coordinates4[3],0)
  assert.equal(h.position.length,3);assert.ok(h.position.every(Number.isFinite))
  if(view==='state-direction')assert.equal(h.position[2],0)
  else assert.equal(h.omitted,0)
 }
})
test('diagnostic mesh retains 4D source and face topology',()=>{
 const mesh=reciprocalHopfSurfaceMesh(p,{nZ:12,nLine:8})
 for(const view of ['state-amplitude','state-direction']){
  const projected=projectReciprocalHopfMesh(mesh,p,{view})
  assert.equal(projected.kind,'regular');assert.deepEqual(projected.indices,mesh.indices)
  assert.equal(projected.positions.length,mesh.positions.length)
  assert.equal(projected.omitted.length,mesh.positions.length/3)
  assert.equal(projected.positions4.length,mesh.positions.length/3*4)
 }
})
test('invalid diagnostic view rejected explicitly',()=>{
 assert.equal(projectReciprocalHopfPoint(0,0,0,p,'minus',{view:'tau-Y-zc'}).kind,'invalid-view')
})

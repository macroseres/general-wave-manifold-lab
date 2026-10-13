import test from 'node:test'
import assert from 'node:assert/strict'
import {hopfSurfaceMesh} from '../src/geometry/hopf/surface.js'
import {hopfAtlasAt} from '../src/math/sonic/hopfAtlas.js'
const p={a20:1.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
for(const side of ['minus','plus'])test(`implicit Hopf ${side} stays on trace=0 and det>=0`,()=>{
  const mesh=hopfSurfaceMesh(p,{tauMin:-1,tauMax:1,YMin:-6,YMax:6,side,method:'implicit'})
  assert.ok(mesh.positions.length>0)
  for(let i=0;i<mesh.positions.length;i+=3){
    const [tau,Y,z]=mesh.positions.slice(i,i+3)
    assert.ok(tau>=-1-1e-7&&tau<=1+1e-7)
    assert.ok(Y>=-6-1e-7&&Y<=6+1e-7)
    const h=hopfAtlasAt(tau,Y,z,p,side)
    assert.equal(h.kind,'regular')
    assert.ok(Math.abs(h.trace)<1e-7,`trace=${h.trace}`)
    assert.ok(h.det>=-1e-6,`det=${h.det}`)
  }
})

for(const side of ['minus','plus'])test(`Hopf ${side} retains strips across local graph chart changes`,()=>{
  const mesh=hopfSurfaceMesh(p,{tauMin:-1,tauMax:1,YMin:-6,YMax:6,side,method:'implicit'})
  // Reference regression: previously a chart mismatch dropped entire strips
  // (674/676 triangles), producing visible seams.
  assert.ok(mesh.indices.length/3>=700,`unexpected missing strips: ${mesh.indices.length/3} faces`)
  assert.equal(mesh.indices.length%3,0)
  assert.ok(mesh.positions.every(Number.isFinite))
})

for(const side of ['minus','plus'])test(`Hopf ${side} uses coherent graph without strip chart seams`,()=>{
  const mesh=hopfSurfaceMesh(p,{tauMin:-1,tauMax:1,YMin:-6,YMax:6,side,method:'implicit'})
  assert.ok(mesh.indices.length/3>=800,`too few faces: ${mesh.indices.length/3}`)
  for(let i=0;i<mesh.positions.length;i+=3){
    const [tau,Y,z]=mesh.positions.slice(i,i+3)
    const h=hopfAtlasAt(tau,Y,z,p,side)
    assert.equal(h.kind,'regular')
    assert.ok(Math.abs(h.trace)<1e-6)
    assert.ok(h.det>=-1e-6)
  }
})

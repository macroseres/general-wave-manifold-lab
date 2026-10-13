import test from 'node:test'
import assert from 'node:assert/strict'
import { reciprocalHopfSurfaceMesh } from '../src/geometry/hopf/reciprocalSurface.js'
import { reciprocalHopfAt } from '../src/math/sonic/hopfReciprocal.js'
const p={a20:1.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
test('reciprocal Hopf patch uses native coordinates and finite triangles',()=>{
  for(const side of ['minus','plus']){
    const mesh=reciprocalHopfSurfaceMesh(p,{side,freeMin:-10,freeMax:10,XMin:-10,XMax:10,ZMin:-.3,ZMax:.3,nZ:40,nLine:32})
    assert.equal(mesh.kind,'regular')
    assert.equal(mesh.chart,'reciprocal')
    assert.deepEqual(mesh.coordinates,['free','X','Z'])
    assert.equal(mesh.positions.length%9,0)
    assert.equal(mesh.indices.length,mesh.positions.length/3)
    assert.ok(mesh.positions.every(Number.isFinite))
    for(let i=0;i<mesh.positions.length;i+=3){
      const h=reciprocalHopfAt(...mesh.positions.slice(i,i+3),p,side)
      assert.equal(h.kind,'regular')
      assert.ok(Math.abs(h.trace)<.06,`trace residual ${h.trace}`)
    }
  }
})
test('reciprocal patch rejects invalid sampling ranges',()=>{
  assert.equal(reciprocalHopfSurfaceMesh(p,{ZMin:1,ZMax:-1}).kind,'invalid-input')
})

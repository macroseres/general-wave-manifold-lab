import test from 'node:test'
import assert from 'node:assert/strict'
import { reciprocalHopfDisplayMesh } from '../src/geometry/hopf/reciprocalDisplay.js'
import { hopfAtlasAt } from '../src/math/sonic/hopfAtlas.js'
const p={a20:1.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
for(const side of ['minus','plus'])test(`reciprocal display ${side} preserves implicit Hopf and bounds`,()=>{
  const mesh=reciprocalHopfDisplayMesh(p,{side})
  assert.ok(mesh.stats.nativeTriangles>0)
  assert.equal(mesh.indices.length,mesh.positions.length/3)
  assert.equal(mesh.stats.displayTriangles,mesh.indices.length/3)
  for(let i=0;i<mesh.positions.length;i+=3){
    const [tau,Y,zc]=mesh.positions.slice(i,i+3)
    assert.ok(Number.isFinite(tau)&&Number.isFinite(Y)&&Math.abs(zc)<1)
    assert.ok(tau>=-1&&tau<=1&&Y>=-6&&Y<=6)
    const h=hopfAtlasAt(tau,Y,zc,p,side)
    assert.equal(h.kind,'regular')
    assert.ok(Math.abs(h.trace)<1e-5,`trace ${h.trace}`)
    assert.ok(h.det>-1e-6,`det ${h.det}`)
  }
})

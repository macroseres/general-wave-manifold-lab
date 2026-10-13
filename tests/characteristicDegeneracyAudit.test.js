import test from 'node:test'
import assert from 'node:assert/strict'
import { characteristicMesh } from '../src/geometry/characteristic/mesh.js'

const base = {a20:0,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:0}

test('jacobiano escalar: carta inteira degenerada deve ser explicitamente diagnosticada',()=>{
  const p={...base,a10:1,b01:1}
  const mesh=characteristicMesh(p,-1,1,{nTau:8,nZ:8})
  assert.equal(mesh.diagnostics.invalidTriangles,128)
  assert.equal(mesh.diagnostics.inputArea,0)
  assert.equal(mesh.diagnostics.sharedEdges,0)
  assert.ok(mesh.leaves.every(leaf=>leaf.coords.length===0))
})

test('caso misto próximo às extremidades: malha finita e área conservada',()=>{
  const p={a20:4.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
  const mesh=characteristicMesh(p,-2,2,{nTau:18,nZ:80})
  const d=mesh.diagnostics
  assert.equal(d.invalidTriangles,0)
  assert.ok(Math.abs(d.inputArea-d.slowArea-d.fastArea-d.coincidenceArea)<1e-7*d.inputArea)
  for(const leaf of mesh.leaves) assert.ok(leaf.coords.every(Number.isFinite))
  for(const point of mesh.boundary) assert.ok(point.every(Number.isFinite))
})

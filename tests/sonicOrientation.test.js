import test from 'node:test'
import assert from 'node:assert/strict'
import {orientTrianglesConsistently} from '../src/geometry/sonic/orientTriangles.js'
import {sonicSurfaceTriangles} from '../src/geometry/sonic/surface.js'

test('adjacent reversed triangles become consistently oriented',()=>{
 const r=orientTrianglesConsistently([0,1,2,1,2,3])
 assert.equal(r.diagnostics.remainingConflicts,0)
 assert.equal(r.diagnostics.changed,1)
})
test('sonic mesh preserves triangle counts and fixes shared-edge orientations',()=>{
 const p={a20:1.9,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
 const mesh=sonicSurfaceTriangles(p,{tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMin:-.999,zcMax:.999,nTau:34,nY:28,nZ:50,side:'minus'})
 const r=orientTrianglesConsistently(mesh.indices)
 assert.equal(r.indices.length,mesh.indices.length)
 assert.equal(r.diagnostics.remainingConflicts,0)
 assert.ok(r.diagnostics.changed>0)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import {hopfSurfaceMesh} from '../src/geometry/hopf/surface.js'
import {auditHopfBoundaryProvenance} from '../src/geometry/hopf/boundaryProvenance.js'
const p={a20:1.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
test('recording rejected candidates does not alter generated Hopf triangles',()=>{
  const opts={tauMin:-1,tauMax:1,YMin:-6,YMax:6,side:'minus',nTau:8,nZ:12,diagnostics:true}
  const a=hopfSurfaceMesh(p,opts),b=hopfSurfaceMesh(p,{...opts,recordRejectedTriangles:true})
  assert.deepEqual(a.positions,b.positions)
  assert.deepEqual(a.indices,b.indices)
  assert.equal(b.diagnostics.rejectedTriangles.length,b.diagnostics.candidates.rejected)
})
test('boundary provenance categories exhaust the exposed edges',()=>{
  const mesh=hopfSurfaceMesh(p,{tauMin:-1,tauMax:1,YMin:-6,YMax:6,side:'plus',nTau:8,nZ:12,diagnostics:true,recordRejectedTriangles:true})
  const result=auditHopfBoundaryProvenance(mesh,mesh.diagnostics.rejectedTriangles)
  assert.equal(result.counts.total,result.counts.nearSingleReason+result.counts.nearMultipleReasons+result.counts.noNearbyRejectedTriangle)
  assert.equal(result.validRejectedCandidates,mesh.diagnostics.candidates.rejected)
})

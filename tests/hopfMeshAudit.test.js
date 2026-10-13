import test from 'node:test'
import assert from 'node:assert/strict'
import {auditHopfMesh,classifyHopfBoundaries} from '../src/geometry/hopf/meshAudit.js'
import {hopfSurfaceMesh} from '../src/geometry/hopf/surface.js'
const p={a20:1.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
test('Hopf audit reports finite diagnostics for both sides',()=>{
  for(const side of ['minus','plus']){
    const m=hopfSurfaceMesh(p,{tauMin:-1,tauMax:1,YMin:-6,YMax:6,side,nTau:18,nZ:28})
    const d=auditHopfMesh(m,p,side)
    assert.ok(d.faces>0)
    assert.equal(d.invalidFaces,0)
    assert.equal(d.chartCrossingFaces,0)
    assert.equal(d.nonManifoldEdges,0)
    assert.ok(Number.isFinite(d.maxTraceResidual))
  }
})
test('Hopf audit detects disconnected triangles and open edges',()=>{
  const m={positions:[0,0,0,1,0,0,0,1,0, 4,0,0,5,0,0,4,1,0]}
  const d=auditHopfMesh(m,p,'minus')
  assert.equal(d.faces,2)
  assert.equal(d.connectedComponents,2)
  assert.equal(d.boundaryEdges,6)
})

test('boundary classification recognizes rectangle edges without guessing their cause',()=>{
  const m={positions:[-1,0,0,-1,1,0,0,0,0]}
  const d=classifyHopfBoundaries(m,p,'minus')
  assert.equal(d.boundaryEdges,3)
  assert.equal(d.categories.windowTau,1)
  assert.equal(Object.values(d.categories).reduce((a,b)=>a+b,0),3)
})
test('boundary classification is deterministic and accounts for all exposed edges',()=>{
  const m=hopfSurfaceMesh(p,{tauMin:-1,tauMax:1,YMin:-6,YMax:6,side:'plus',nTau:18,nZ:28})
  const d=classifyHopfBoundaries(m,p,'plus')
  assert.equal(d.boundaryEdges,auditHopfMesh(m,p,'plus').boundaryEdges)
  assert.deepEqual(d,classifyHopfBoundaries(m,p,'plus'))
})

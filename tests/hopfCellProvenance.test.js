import test from 'node:test'
import assert from 'node:assert/strict'
import {hopfSurfaceMesh} from '../src/geometry/hopf/surface.js'
import {auditHopfCellProvenance} from '../src/geometry/hopf/cellProvenance.js'
const p={a20:1.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
for(const side of ['minus','plus'])test(`Hopf ${side}: exact cell provenance preserves output`,()=>{
 const options={tauMin:-1,tauMax:1,YMin:-6,YMax:6,side,nTau:12,nZ:18}
 const baseline=hopfSurfaceMesh(p,options)
 const traced=hopfSurfaceMesh(p,{...options,diagnostics:true,recordCellProvenance:true})
 assert.deepEqual(traced.positions,baseline.positions)
 assert.deepEqual(traced.indices,baseline.indices)
 const audit=auditHopfCellProvenance(traced)
 assert.equal(audit.candidateTriangles,2*12*18)
 assert.equal(audit.accepted+audit.rejected,audit.candidateTriangles)
 assert.equal(audit.outputFaces,traced.positions.length/9)
 assert.equal(audit.boundaries.total,audit.boundaries.fromClippedFaces+audit.boundaries.fromUnclippedFaces)
})

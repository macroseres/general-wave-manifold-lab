import test from 'node:test'
import assert from 'node:assert/strict'
import { doubleSonicGeometry, inflectionGeometry } from '../src/geometry/sonic/surface.js'
import { zFromZc } from '../src/math/charts/zChart.js'
import { sonicImplicit } from '../src/math/sonic/sonic.js'
import { doubleSonicBaseResidual, doubleSonicResidual, inflectionResidual } from '../src/math/sonic/intersections.js'

const p={a20:4.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}

test('DS is the off-characteristic common zero of both implicit sonic equations',()=>{
  const ds=doubleSonicGeometry(p,{tauMin:-5,tauMax:5,YMin:-6,YMax:6,nTau:120,nZ:180})
  assert.ok(ds.length>0)
  for(const line of ds){
    const z=zFromZc(line.zc)
    assert.ok(doubleSonicBaseResidual(line.tau,z,p)<1e-7)
    for(const Y of [-3,3]){
      assert.ok(doubleSonicResidual(line.tau,Y,z,p)<1e-6)
      assert.ok(Math.abs(sonicImplicit(line.tau,Y,z,p,'minus'))<1e-6)
      assert.ok(Math.abs(sonicImplicit(line.tau,Y,z,p,'plus'))<1e-6)
    }
  }
})

test('J is K=0 on the characteristic surface Y=0',()=>{
  const segments=inflectionGeometry(p,{tauMin:-5,tauMax:5,nTau:120,nZ:180})
  assert.ok(segments.length>0)
  for(const segment of segments.slice(0,50)) for(const q of segment){
    const z=zFromZc(q.zc)
    assert.ok(inflectionResidual(q.tau,z,p)<2e-2)
    assert.ok(Math.abs(sonicImplicit(q.tau,0,z,p,'minus'))<4e-2)
    assert.ok(Math.abs(sonicImplicit(q.tau,0,z,p,'plus'))<4e-2)
  }
})

test('the canonical common sonic set is exactly J union DS',async()=>{
  const {classifyCommonSonicPoint,commonSonicIdentityResidual}=await import('../src/math/sonic/commonIntersection.js')
  const ds=doubleSonicGeometry(p,{tauMin:-5,tauMax:5,YMin:-6,YMax:6,nTau:120,nZ:180})
  for(const line of ds){
    const z=zFromZc(line.zc)
    for(const Y of [-3,3]){
      const c=classifyCommonSonicPoint(line.tau,Y,z,p)
      assert.equal(c.common,true);assert.equal(c.onDS,true)
      assert.ok(commonSonicIdentityResidual(line.tau,Y,z,p)<1e-10)
    }
  }
  const j=inflectionGeometry(p,{tauMin:-5,tauMax:5,nTau:120,nZ:180})
  for(const q of j.flat().slice(0,40)){
    const c=classifyCommonSonicPoint(q.tau,0,zFromZc(q.zc),p,{absoluteTolerance:5e-2})
    assert.equal(c.common,true);assert.equal(c.onJ,true)
  }
})

test('independent sonic meshes represent their common set only on J union DS',async()=>{
  const {sonicSurfaceTriangles}=await import('../src/geometry/sonic/surface.js')
  const {auditCommonSonicMeshes}=await import('../src/geometry/sonic/commonIntersectionAudit.js')
  const options={tauMin:-5,tauMax:5,YMin:-6,YMax:6,nTau:20,nY:18,nZ:28}
  const minus=sonicSurfaceTriangles(p,{...options,side:'minus'})
  const plus=sonicSurfaceTriangles(p,{...options,side:'plus'})
  const ds=doubleSonicGeometry(p,options)
  const canonicalDS=ds.flatMap(line=>[-3,3].map(Y=>[line.tau,Y,line.zc]))
  // J is inserted on Y=0 by the constrained grid. Use its extracted endpoints
  // as canonical mathematical samples; the audit still tests both Phi equations.
  const j=inflectionGeometry(p,{tauMin:-5,tauMax:5,nTau:80,nZ:120})
  const canonicalJ=j.flat().filter((_,i)=>i%20===0).map(q=>[q.tau,0,q.zc])
  const audit=auditCommonSonicMeshes(minus,plus,p,{implicitTolerance:2e-5,matchTolerance:.35,canonicalJ,canonicalDS})
  assert.ok(audit.commonSampleCount>0)
  assert.equal(audit.unclassifiedCommonCount,0)
  assert.ok(audit.maxDSDistance<.35)
  assert.ok(audit.maxJDistance<.35)
  assert.equal(audit.canonicalCoverageSatisfied,true)
})

test('geometric mesh intersection produces segments independently of canonical equations',async()=>{
  const {intersectSonicTriangleMeshes}=await import('../src/geometry/sonic/triangleIntersection.js')
  const mesh=(points)=>({positions:new Float64Array(points.flat()),indices:[0,1,2]})
  const a=mesh([[0,0,0],[1,0,0],[0,1,0]])
  const b=mesh([[.25,-1,-1],[.25,2,-1],[.25,.5,1]])
  const result=intersectSonicTriangleMeshes(a,b,{cellSize:.5})
  assert.equal(result.segmentCount,1)
  for(const q of result.segments[0]){assert.ok(Math.abs(q[0]-.25)<1e-8);assert.ok(Math.abs(q[2])<1e-8)}
})

test('real implicit sonic meshes have a geometric intersection',async()=>{
  const {sonicSurfaceTriangles}=await import('../src/geometry/sonic/surface.js')
  const {intersectSonicTriangleMeshes}=await import('../src/geometry/sonic/triangleIntersection.js')
  const options={tauMin:-5,tauMax:5,YMin:-6,YMax:6,nTau:12,nY:10,nZ:16}
  const minus=sonicSurfaceTriangles(p,{...options,side:'minus'})
  const plus=sonicSurfaceTriangles(p,{...options,side:'plus'})
  const result=intersectSonicTriangleMeshes(minus,plus,{cellSize:1})
  assert.ok(result.segmentCount>0)
})

test('continuous segment audit does not confuse sample spacing with geometric error', async()=>{
  const {compareGeometricSonicIntersection}=await import('../src/geometry/sonic/commonIntersectionAudit.js')
  const segments=[[[0,-1,0],[0,1,0]]]
  const result=compareGeometricSonicIntersection(segments,[],[[[0,-1,0],[0,0,0],[0,1,0]]])
  assert.ok(result.DS.maxDistance<1e-12)
  assert.ok(result.DS.meshToCanonical.maxDistance<1e-12)
})

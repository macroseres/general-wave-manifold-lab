import test from 'node:test'
import assert from 'node:assert/strict'
import { projectToSonic, refineProjectedSonicMesh, implicitEstimate } from '../src/geometry/sonic/projectedRefinement.js'
import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'
const p={a20:1.9,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
test('projected midpoint reduces implicit distance for an off-surface point',()=>{
  const mesh=sonicSurfaceTriangles(p,{tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMin:-.999,zcMax:.999,nTau:12,nY:10,nZ:14,side:'minus'})
  let checked=false
  for(let k=0;k<mesh.indices.length;k+=3){
    const a=mesh.indices[k],b=mesh.indices[k+1]
    const q=[0,1,2].map(i=>(mesh.positions[3*a+i]+mesh.positions[3*b+i])/2)
    const before=implicitEstimate(q,p,'minus')
    if(!before||before.estimate<1e-7||Math.abs(q[2])>.98)continue
    const r=projectToSonic(q,p,'minus',{maxMove:.5,zcLimit:.999})
    if(!r.accepted)continue
    const after=implicitEstimate(r.point,p,'minus')
    assert.ok(after.estimate<before.estimate)
    checked=true;break
  }
  assert.ok(checked,'at least one midpoint can be projected')
})
test('experimental projected refinement preserves original mesh arrays',()=>{
  const mesh=sonicSurfaceTriangles(p,{tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMin:-.999,zcMax:.999,nTau:12,nY:10,nZ:14,side:'minus'})
  const positions=Array.from(mesh.positions),indices=Array.from(mesh.indices)
  const refined=refineProjectedSonicMesh(mesh,p,'minus',{maxSelected:20})
  assert.deepEqual(Array.from(mesh.positions),positions)
  assert.deepEqual(Array.from(mesh.indices),indices)
  assert.equal(refined.indices.length%3,0)
  assert.ok(refined.triangleCount>=mesh.triangleCount)
})

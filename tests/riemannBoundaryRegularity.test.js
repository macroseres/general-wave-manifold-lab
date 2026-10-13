import test from 'node:test'
import assert from 'node:assert/strict'
import {riemannBoundaryRegularity} from '../src/math/manifold/riemannBoundaryRegularity.js'
const p={a20:0,a11:0,a02:0,a10:1,a01:0,b20:0,b11:0,b02:0,b10:0,b01:2}
test('regular characteristic boundary for distinct real eigenvalues',()=>{
 const r=riemannBoundaryRegularity([0,0],[1,1],p)
 for(const side of ['forward','backward']){
  assert.equal(r[side].directions.length,2)
  for(const d of r[side].directions){assert.equal(d.boundary.onManifold,true);assert.equal(d.boundary.regularLevelSet,true);assert.ok(d.boundary.residual<1e-8)}
 }
})
test('missing states have no characteristic boundary',()=>{
 const r=riemannBoundaryRegularity(null,null,p)
 assert.equal(r.forward.directions.length,0)
 assert.equal(r.backward.directions.length,0)
})

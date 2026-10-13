import test from 'node:test'
import assert from 'node:assert/strict'
import {segmentIncidenceRoots} from '../src/math/solution/riemannMixedRootSearch.js'
const a=[0,0],b=[1,0]
test('detects tangential double root without sign change',()=>{
  const roots=segmentIncidenceRoots(a,b,U=>(U[0]-0.37)**2)
  assert.equal(roots.length,1)
  assert.ok(Math.abs(roots[0].t-0.37)<1e-10)
  assert.equal(roots[0].method,'stationary-probe')
})
test('rejects near-tangency without a true root',()=>{
  const roots=segmentIncidenceRoots(a,b,U=>(U[0]-0.37)**2+1e-5)
  assert.equal(roots.length,0)
})
test('finds two transversal roots on one segment',()=>{
  const roots=segmentIncidenceRoots(a,b,U=>(U[0]-0.2)*(U[0]-0.8))
  assert.equal(roots.length,2)
  assert.ok(Math.abs(roots[0].t-0.2)<1e-8)
  assert.ok(Math.abs(roots[1].t-0.8)<1e-8)
})

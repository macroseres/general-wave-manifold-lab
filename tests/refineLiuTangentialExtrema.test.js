import test from 'node:test'
import assert from 'node:assert/strict'
import {refineLiuTangentialExtrema} from '../src/math/solution/refineLiuTangentialExtrema.js'

const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:4}

test('regular monotone Hugoniot arc has no stationary-speed candidate',()=>{
  const result=refineLiuTangentialExtrema([2,0],[[2,0],[1.5,0],[1,0],[.5,0]],p)
  assert.equal(result.status,'refined-candidates')
  assert.equal(result.roots.length,0)
})
test('near-zero derivative is retained as an unrefined sample',()=>{
  const linear={...p,a20:0,a10:1}
  const result=refineLiuTangentialExtrema([2,0],[[2,0],[1.5,0],[1,0],[.5,0]],linear)
  assert.equal(result.status,'refined-candidates')
  assert.ok(result.roots.length>0)
  assert.ok(result.roots.every(q=>q.status==='near-zero-sample'))
})
test('invalid arc does not yield a fabricated root',()=>{
  const result=refineLiuTangentialExtrema([2,0],[[2,0],[1,1]],p)
  assert.equal(result.status,'inconclusive')
  assert.deepEqual(result.roots,[])
})
test('invalid refinement parameters are rejected',()=>{
  assert.equal(refineLiuTangentialExtrema([2,0],[],p,{maxIterations:0}).status,'invalid-options')
})

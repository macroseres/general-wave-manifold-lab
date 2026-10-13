import test from 'node:test'
import assert from 'node:assert/strict'
import {middleConvergenceOrder} from '../src/math/solution/riemannMiddleConvergenceOrder.js'
const row=(step,x)=>({step,status:'matched',middle:[x,0]})
test('estimates second order from successive halving differences',()=>{
  const r=middleConvergenceOrder({rows:[row(0.4,0.16),row(0.2,0.04),row(0.1,0.01),row(0.05,0.0025)]})
  assert.equal(r.status,'observed-order')
  assert.ok(Math.abs(r.orders[0].value-2)<1e-10)
  assert.ok(Math.abs(r.orders[1].value-2)<1e-10)
})
test('does not assign artificial order to identical approximations',()=>{
  const r=middleConvergenceOrder({rows:[row(0.4,1),row(0.2,1),row(0.1,1)]})
  assert.equal(r.status,'unresolved-order')
  assert.equal(r.orders[0].value,null)
})
test('does not infer order from missing or ambiguous roots',()=>{
  const r=middleConvergenceOrder({rows:[row(0.4,1),{step:0.2,status:'ambiguous-roots'},row(0.1,1)]})
  assert.equal(r.status,'inconclusive')
})
test('flags large branch displacement without declaring a bifurcation',()=>{
  const r=middleConvergenceOrder({rows:[row(0.4,0),row(0.2,1),row(0.1,2)]})
  assert.equal(r.branchStatus,'large-displacement')
})

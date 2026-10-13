import test from 'node:test'
import assert from 'node:assert/strict'
import { genuineNonlinearityAt, genuineNonlinearityEvents } from '../src/math/rarefaction/genuineNonlinearity.js'

const decoupled = {a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0.5,b10:0,b01:0}
test('directional characteristic derivative for diagonal quadratic flux', () => {
  const result = genuineNonlinearityAt([0,2],decoupled,'slow')
  assert.equal(result.status,'estimated')
  assert.ok(Math.abs(Math.abs(result.value)-1)<1e-5)
})
test('elliptic point cannot be assigned real genuine nonlinearity', () => {
  const p={a20:0,a11:0,a02:0,a10:0,a01:-1,b20:0,b11:0,b02:0,b10:1,b01:0}
  assert.equal(genuineNonlinearityAt([0,0],p,'slow').status,'non-strict-hyperbolicity')
})
test('detects near-zero derivative without claiming exact root', () => {
  const p={a20:0,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:2}
  const result=genuineNonlinearityEvents({family:'slow',points:[[0,0],[0.2,0],[0.4,0]]},p)
  assert.ok(result.events.some(event=>event.kind==='near-zero'))
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { infinitesimalSonicContact, annotateGenuineNonlinearityContact } from '../src/math/rarefaction/sonicContactDiagnostic.js'
const diagonal = { a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:1,b10:0,b01:0 }
test('simple diagonal slow field has exact derivative and half shock-speed slope', () => {
  const q = infinitesimalSonicContact([0,2],diagonal,'slow')
  assert.equal(q.status,'evaluated')
  assert.ok(Math.abs(q.genuineNonlinearity-1)<1e-10)
  assert.ok(Math.abs(q.shockSpeedDerivative-0.5)<1e-10)
  assert.ok(q.consistencyResidual<1e-5)
  assert.equal(q.candidateContact,false)
})
test('linearly degenerate field is an infinitesimal contact candidate', () => {
  const p={...diagonal,a20:0,a10:1}
  const q=infinitesimalSonicContact([0,2],p,'slow')
  assert.equal(q.status,'evaluated')
  assert.ok(Math.abs(q.genuineNonlinearity)<1e-12)
  assert.equal(q.candidateContact,true)
})
test('elliptic states are not assigned real contact slopes', () => {
  const p={a20:0,a11:0,a02:0,a10:0,a01:-1,b20:0,b11:0,b02:0,b10:1,b01:0}
  assert.equal(infinitesimalSonicContact([0,0],p,'slow').status,'undefined-characteristic')
})
test('event annotation preserves coordinates and does not certify finite sonic contact', () => {
  const branch={family:'slow',points:[[0,2]],events:[{kind:'near-zero',point:[0,2]}]}
  const result=annotateGenuineNonlinearityContact(branch,diagonal)
  assert.deepEqual(result.events[0].point,[0,2])
  assert.equal(result.events[0].sonicContact.scope,'infinitesimal-coincidence-only')
})

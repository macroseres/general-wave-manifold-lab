import test from 'node:test'
import assert from 'node:assert/strict'
import {refineRarefactionIntersection} from '../src/math/solution/rarefactionJointCorrector.js'
import {rarefactionPairCandidates} from '../src/math/solution/rarefactionPairCandidates.js'

const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:.75,b01:0}
const left={side:'left',family:'slow',sign:1,points:[[0,-1],[0,-.8],[0,-.6]]}
const right={side:'right',family:'fast',sign:-1,points:[[1,.25],[.5,-.25],[-.5,-1.25]]}

test('joint RR corrector recovers analytic triangular intersection',()=>{
  const q=refineRarefactionIntersection(left,right,p,1.25,1)
  assert.equal(q.status,'refined-candidate')
  assert.ok(Math.hypot(q.middle[0],q.middle[1]+.75)<1e-7)
  assert.ok(q.residual<1e-8)
  assert.equal(q.entropyCertified,false)
})

test('RR candidate stores independent integration evidence',()=>{
  const q=rarefactionPairCandidates({left:[0,-1],right:[1,.25]},[left,right],p)[0]
  assert.ok(q)
  assert.equal(q.refinement.status,'refined-candidate')
  assert.equal(q.evidence.geometry,'reintegrated-intersection')
  assert.equal(q.search.complete,false)
})

test('joint corrector refuses invalid parameter ranges',()=>{
  assert.equal(refineRarefactionIntersection(left,right,p,-1,0).status,'invalid-input')
})

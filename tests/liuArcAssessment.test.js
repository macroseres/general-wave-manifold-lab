import test from 'node:test'
import assert from 'node:assert/strict'
import {assessForwardLiuArc} from '../src/math/solution/liuArcAssessment.js'

const compatible=()=>({status:'refined-liu-compatible',violations:[],
  stationaryOrdering:{status:'stationary-no-violation-detected',violations:[]},
  tangentialRefinement:{unresolved:0}})
const sampled=()=>({status:'sampled-liu-compatible',violations:[]})

test('all finite checks compatible does not certify Liu',()=>{
  const q=assessForwardLiuArc(sampled(),compatible())
  assert.equal(q.status,'no-liu-violation-detected')
  assert.equal(q.passes,false)
})
test('stationary-speed violation overrides compatible samples',()=>{
  const interior=compatible()
  interior.stationaryOrdering={status:'stationary-liu-violation',violations:[{speed:0}]}
  const q=assessForwardLiuArc(sampled(),interior)
  assert.equal(q.status,'liu-violation-detected')
  assert.deepEqual(q.violationSources,['stationary-speed'])
})
test('sampled violation overrides inconclusive interior',()=>{
  const q=assessForwardLiuArc({status:'sampled-liu-violation',violations:[{}]},null)
  assert.equal(q.status,'liu-violation-detected')
})
test('unresolved stationary brackets remain inconclusive',()=>{
  const interior=compatible()
  interior.tangentialRefinement.unresolved=2
  assert.equal(assessForwardLiuArc(sampled(),interior).status,'liu-inconclusive')
})
test('missing reports cannot be considered compatible',()=>{
  const q=assessForwardLiuArc(null,null)
  assert.equal(q.status,'liu-inconclusive')
  assert.equal(q.passes,false)
})

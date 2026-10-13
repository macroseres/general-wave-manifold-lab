import test from "node:test"
import assert from "node:assert/strict"
import { decomposeCompositeBranches } from "../src/math/state/compositeTrace.js"

const q=(z,Y=1)=>({z,Y})

test("continues nearby roots and keeps distinct branches separated",()=>{
  const trace=[
    {P:{id:0},intersections:[q(-1),q(1)]},
    {P:{id:1},intersections:[q(-0.9),q(1.1)]},
    {P:{id:2},intersections:[q(-0.8),q(1.2)]},
  ]
  const branches=decomposeCompositeBranches(trace)
  assert.equal(branches.length,2)
  assert.deepEqual(branches.map(b=>b.points.length).sort((a,b)=>a-b),[3,3])
})

test("terminates a branch when a root disappears instead of bridging a gap",()=>{
  const trace=[{intersections:[q(0)]},{intersections:[]},{intersections:[q(0.05)]}]
  const branches=decomposeCompositeBranches(trace)
  assert.equal(branches.length,2)
  assert.equal(branches.every(b=>b.points.length===1),true)
})

test("matches reciprocal-chart roots through projective coordinates",()=>{
  const trace=[
    {intersections:[{reciprocal:true,Z:0.1,Upsilon:2}]},
    {intersections:[{reciprocal:true,Z:0.05,Upsilon:4}]},
    {intersections:[{reciprocal:true,Z:0,Upsilon:5}]},
  ]
  const branches=decomposeCompositeBranches(trace,{maxMatchDistance:1})
  assert.equal(branches.length,1)
  assert.equal(branches[0].points.length,3)
})

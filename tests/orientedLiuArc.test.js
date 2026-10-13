import test from 'node:test'
import assert from 'node:assert/strict'
import {orientedForwardLiuArc,sampledLiuAtForwardContact} from '../src/math/solution/orientedLiuArc.js'
import {defaultCoefficients} from '../src/math/flux/quadraticFlux.js'

test('locates and orients a sampled forward arc from a fixed endpoint',()=>{
 const segments=[{points:[{u:0,v:0},{u:0.5,v:0},{u:1,v:0},{u:1.5,v:0}]}]
 const q=orientedForwardLiuArc([0,0],[1,0],segments)
 assert.equal(q.status,'sampled-arc')
 assert.deepEqual(q.arc,[[0,0],[0.5,0],[1,0]])
})
test('reverses an incoming segment to anchor at the fixed state',()=>{
 const q=orientedForwardLiuArc([0,0],[1,0],[{points:[{u:1,v:0},{u:0.5,v:0},{u:0,v:0}]}])
 assert.equal(q.status,'sampled-arc')
 assert.deepEqual(q.arc.at(0),[0,0])
})
test('does not invent a path if no endpoint anchors the fibre',()=>{
 const q=orientedForwardLiuArc([0,0],[1,0],[{points:[{u:0.2,v:0},{u:0.5,v:0},{u:1,v:0}]}])
 assert.equal(q.status,'arc-not-resolved')
})
test('unresolved arcs cannot pass sampled Liu',()=>{
 const q=sampledLiuAtForwardContact([0,0],{refinement:{status:'converged',point:[1,0]}},[],defaultCoefficients)
 assert.equal(q.passes,false)
 assert.equal(q.status,'arc-not-resolved')
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { cubicRealRoots, quadraticRoots } from '../src/math/numerics/polynomialRoots.js'
import { decomposeCompositeBranches } from '../src/math/state/compositeTrace.js'
import { infinityRarefactionLinearData } from '../src/math/rarefaction/singularities.js'

const close=(a,b,tol=1e-7)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`)
const q=z=>({z,Y:1,tau:0})

test('cubic: three simple real directions are ordered and satisfy polynomial',()=>{
 const roots=cubicRealRoots(1,-2,-5,6)
 assert.equal(roots.length,3)
 for(const r of roots)close(((r-2)*r-5)*r+6,0)
 assert.ok(roots[0]<roots[1]&&roots[1]<roots[2])
})
test('cubic: double root is returned once, without multiplicity metadata',()=>{
 const roots=cubicRealRoots(1,0,-3,2).sort((a,b)=>a-b)
 assert.equal(roots.length,2)
 close(roots[0],-2);close(roots[1],1)
})
test('cubic: triple root is returned once',()=>{
 const roots=cubicRealRoots(1,-6,12,-8)
 assert.equal(roots.length,1);close(roots[0],2)
})
test('polynomial degree reduction and absent real quadratic roots',()=>{
 assert.deepEqual(cubicRealRoots(0,0,2,-8),[4])
 assert.deepEqual(quadraticRoots(1,0,1),[])
})
test('infinity equilibrium: nonisolated and absent degenerate cases are distinct',()=>{
 const p={b20:0,b11:2,a20:1,a10:0,a11:0,b10:0,b01:0,b02:0}
 assert.equal(infinityRarefactionLinearData(p).kind,'nonisolated')
 assert.equal(infinityRarefactionLinearData({...p,a10:1}).kind,'absent')
})
test('continuation: root disappearance terminates branch, reappearance starts another',()=>{
 const branches=decomposeCompositeBranches([{intersections:[q(0)]},{intersections:[]},{intersections:[q(.02)]}])
 assert.equal(branches.length,2)
 assert.deepEqual(branches.map(b=>[b.startSample,b.endSample]),[[0,0],[2,2]])
})
test('continuation: distance cutoff avoids false branch bridges',()=>{
 const branches=decomposeCompositeBranches([{intersections:[q(-2)]},{intersections:[q(2)]}],{maxMatchDistance:.1})
 assert.equal(branches.length,2)
})
test('continuation: one-to-one matching prevents reuse of a root',()=>{
 const branches=decomposeCompositeBranches([{intersections:[q(-.1),q(.1)]},{intersections:[q(0)]}],{maxMatchDistance:1})
 assert.equal(branches.length,2)
 assert.deepEqual(branches.map(b=>b.points.length).sort(),[1,2])
})

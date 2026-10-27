import test from 'node:test'
import assert from 'node:assert/strict'
import {intersectWavePolylines,assessMixedWaveChain,mixedWaveCandidates} from '../src/math/solution/mixedWaveChains.js'

const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:3}
test('intersection between state polylines, including u/v objects',()=>{
 const hits=intersectWavePolylines([[0,0],[2,2]],[{u:0,v:2},{u:2,v:0}])
 assert.equal(hits.length,1);assert.deepEqual(hits[0].point,[1,1])
})
test('parallel polylines produce no false intersection',()=>{
 assert.equal(intersectWavePolylines([[0,0],[1,0]],[[0,1],[1,1]]).length,0)
})
test('slow rarefaction followed by fast shock has correct ordering',()=>{
 const q=assessMixedWaveChain([0,0],[1,0],[1,-1],p,'rarefaction-shock','slow')
 assert.equal(q.status,'mixed-ordered-lax-candidate');assert.equal(q.entropyCertified,false)
})
test('fast rarefaction following slow shock fails speed ordering when reversed',()=>{
 const q=assessMixedWaveChain([1,0],[0,0],[0,-1],p,'shock-rarefaction','fast')
 assert.notEqual(q.status,'mixed-ordered-lax-candidate')
})
test('sampled intersections do not assert entropy certification',()=>{
 const branches=[{side:'left',family:'slow',sign:1,points:[[0,0],[1,0]]}]
 const hug={right:[{id:'h',points:[{u:.5,v:-1},{u:.5,v:1}]}],left:[]}
 const found=mixedWaveCandidates({left:[0,0],right:[1,-1]},branches,hug,p)
 assert.equal(found.length,1);assert.equal(found[0].entropyCertified,false)
})


test('mixed search exposes bounded numerical diagnostics',async()=>{
 const {searchMixedWaveCandidates}=await import('../src/math/solution/mixedWaveChains.js')
 const branches=[{side:'left',family:'slow',sign:1,points:[[0,0],[1,0]]}]
 const hug={right:[{id:'h',points:[{u:.5,v:-1},{u:.5,v:1}]}],left:[]}
 const result=searchMixedWaveCandidates({left:[0,0],right:[1,-1]},branches,hug,p)
 assert.equal(result.report.sampledIntersections,1)
 assert.equal(result.report.complete,false)
 assert.ok(Array.isArray(result.report.rejected))
})

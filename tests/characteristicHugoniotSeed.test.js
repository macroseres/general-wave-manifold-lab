import test from 'node:test'
import assert from 'node:assert/strict'
import {characteristicForwardHugoniotSeeds,selectCharacteristicForwardSeed} from '../src/math/solution/characteristicHugoniotSeed.js'
import {forwardHugoniotIncidence} from '../src/math/solution/forwardHugoniotContinuation.js'
import {pseudoArcForwardHugoniot} from '../src/math/solution/pseudoArcHugoniot.js'
const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:2}
const left=[0,0]
test('four corrected seeds lie on two real characteristic RH branches',()=>{
 const result=characteristicForwardHugoniotSeeds(left,p)
 assert.equal(result.status,'seeded')
 assert.equal(result.seeds.length,4)
 for(const seed of result.seeds)assert.ok(Math.abs(forwardHugoniotIncidence(left,seed.point,p))<1e-10)
})
test('oriented guide selects the slow characteristic family',()=>{
 const result=selectCharacteristicForwardSeed(left,[[0,0],[.1,0],[.2,0]],p)
 assert.equal(result.status,'matched-characteristic')
 assert.equal(result.seed.family,'slow')
})
test('noncharacteristic guide cannot silently choose a branch',()=>{
 assert.equal(selectCharacteristicForwardSeed(left,[[0,0],[.1,.1],[.2,.2]],p).status,'guide-not-characteristic')
})
test('coincident eigenvalues remain explicitly unresolved',()=>{
 const coincident={...p,b01:0}
 assert.equal(characteristicForwardHugoniotSeeds(left,coincident).status,'characteristic-unresolved')
})
test('pseudo-arclength reports selected local family on regular guide',()=>{
 const guide=[[0,0],[.1,0],[.3,0],[.6,0]]
 const result=pseudoArcForwardHugoniot(left,guide,p)
 assert.equal(result.status,'pseudoarc-sampled-compatible')
 assert.equal(result.characteristicFamily,'slow')
})

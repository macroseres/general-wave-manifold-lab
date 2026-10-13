import test from 'node:test'
import assert from 'node:assert/strict'
import { exceptionalDirections } from '../src/math/characteristic/exceptionalDirections.js'
const zero = {a20:0,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:0}
test('identically vanishing equation identifies all projective directions',()=>{
 const result=exceptionalDirections(zero)
 assert.equal(result.allDirectionsDegenerate,true)
 assert.ok(result.directions.some(d=>d.z===Infinity))
})
test('constant polynomial has no finite exceptional direction',()=>{
 const result=exceptionalDirections({...zero,a01:1})
 assert.equal(result.allDirectionsDegenerate,false)
 assert.equal(result.directions.filter(d=>Number.isFinite(d.z)).length,0)
})
test('common linear factor yields selectable finite direction',()=>{
 const result=exceptionalDirections({...zero,b11:1,a20:0.5,b10:1})
 assert.ok(result.directions.some(d=>d.z===0))
})

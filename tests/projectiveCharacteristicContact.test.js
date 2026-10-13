import test from 'node:test'
import assert from 'node:assert/strict'
import {classifyRiemannCharacteristicLifts} from '../src/math/characteristic/riemannLifts.js'
const p=(a20,a11,a02,b20,b11,b02)=>({a20,a11,a02,a10:0,a01:0,b20,b11,b02,b10:0,b01:0})
test('distinct real eigenlines are simple roots, including reciprocal infinity',()=>{
 const q=classifyRiemannCharacteristicLifts([1,1],p(1,0,0,0,0,2))
 assert.equal(q.directions.length,2)
 assert(q.directions.some(d=>d.chart==='reciprocal'))
 assert(q.directions.every(d=>d.projectiveContact==='simple'&&d.projectiveResidual<1e-10))
})
test('defective repeated eigenline is a multiple projective root',()=>{
 const q=classifyRiemannCharacteristicLifts([1,1],{...p(0,0,0,0,0,0),a01:1})
 assert.equal(q.directions[0].projectiveContact,'multiple')
 assert(q.directions[0].projectiveDerivative<1e-10)
})
test('elliptic state has no real projective roots',()=>{
 const q=classifyRiemannCharacteristicLifts([1,1],p(0,1,0,-1,0,0))
 assert.deepEqual(q.directions,[])
})

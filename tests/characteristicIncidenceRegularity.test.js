import test from 'node:test'
import assert from 'node:assert/strict'
import {classifyRiemannCharacteristicLifts} from '../src/math/characteristic/riemannLifts.js'
const p=(a20,a11,a02,b20,b11,b02)=>({a20,a11,a02,a10:0,a01:0,b20,b11,b02,b10:0,b01:0})
test('two distinct eigenlines are transverse in reduced incidence including reciprocal chart',()=>{
 const q=classifyRiemannCharacteristicLifts([1,1],p(1,0,0,0,0,2))
 assert.equal(q.directions.length,2)
 assert(q.directions.some(d=>d.chart==='reciprocal'))
 assert(q.directions.every(d=>d.incidenceRegularity==='regular'&&d.fixedStateIntersection==='transverse'))
})
test('defective repeated eigenline is non-transverse but may have regular incidence',()=>{
 const q=classifyRiemannCharacteristicLifts([1,1],{...p(0,0,0,0,0,0),a01:1})
 assert.equal(q.directions[0].fixedStateIntersection,'non-transverse')
 assert.equal(q.directions[0].incidenceRegularity,'degenerate')
 assert.equal(q.directions[0].fullWaveManifoldRegularity,'not-certified')
})
test('coalescing eigenlines can have regular incidence despite non-transverse fixed-state intersection',()=>{
 const q=classifyRiemannCharacteristicLifts([0,0],{...p(0,0,0,0,0,0),a01:1,b20:1})
 assert.equal(q.directions[0].fixedStateIntersection,'non-transverse')
 assert.equal(q.directions[0].incidenceRegularity,'regular')
})

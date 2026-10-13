import test from 'node:test'
import assert from 'node:assert/strict'
import {sampleDegenerateConic} from '../src/math/characteristic/degenerateConicSamples.js'
const window={uMin:-2,uMax:2,vMin:-2,vMax:2}
const p={a20:0,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:0}
test('D identically zero yields plane samples',()=>{const r=sampleDegenerateConic(p,window,{steps:4});assert.equal(r.type,'identicamente nulo');assert.equal(r.points.length,25)})
test('non-degenerate constant discriminant yields no algebraic samples',()=>{const r=sampleDegenerateConic({...p,a10:1,b01:0},window);assert.equal(r.points.length,0)})

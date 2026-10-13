import test from 'node:test'
import assert from 'node:assert/strict'
import {directShockDiagnostic} from '../src/math/solution/directShockDiagnostic.js'
const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:0}
test('no invented shock when an endpoint is missing',()=>assert.equal(directShockDiagnostic(null,[1,0],p).kind,'missing-states'))
test('coincident endpoints do not define a shock speed',()=>assert.equal(directShockDiagnostic([1,0],[1,0],p).kind,'coincident'))
test('Rankine-Hugoniot direct jump is certified algebraically',()=>{const d=directShockDiagnostic([1,0],[-1,0],p);assert.equal(d.rankineHugoniot,true);assert.equal(d.speed,0);assert.equal(d.residualNorm,0)})
test('non-RH jump is not certified by least-squares speed',()=>{const d=directShockDiagnostic([1,0],[0,2],p);assert.equal(d.rankineHugoniot,false);assert.ok(d.residualNorm>0)})

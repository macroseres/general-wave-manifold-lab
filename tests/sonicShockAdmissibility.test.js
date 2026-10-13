import test from 'node:test'
import assert from 'node:assert/strict'
import {sonicShockAdmissibility} from '../src/math/solution/sonicShockAdmissibility.js'
const p={a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0.5,b10:0,b01:4}
test('rejects a jump that does not satisfy Rankine–Hugoniot',()=>{
 assert.equal(sonicShockAdmissibility([0,0],[1,1],p,'slow','plus').status,'rankine-hugoniot-failed')
})
test('rejects a nonsonic RH jump',()=>{
 const d=sonicShockAdmissibility([2,0],[0,0],p,'slow','plus')
 assert.equal(d.status,'endpoint-inequality-failed');assert.equal(d.sonic,false)
})
test('rejects a sonic expansion shock by endpoint inequalities',()=>{
 // Burgers left=0, right=2 has speed 1, so not sonic; a sonic equality
 // can be manufactured only for a degeneracy in a nonlinear flux.
 const d=sonicShockAdmissibility([0,0],[2,0],p,'slow','plus')
 assert.equal(d.passes,false);assert.equal(d.compressive,false)
})
test('invalid family and missing states do not pass',()=>{
 assert.equal(sonicShockAdmissibility([0,0],[1,0],p,'middle','plus').status,'invalid-input')
 assert.equal(sonicShockAdmissibility(null,[1,0],p,'slow','plus').passes,false)
})

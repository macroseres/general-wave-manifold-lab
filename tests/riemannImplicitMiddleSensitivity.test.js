import test from 'node:test'
import assert from 'node:assert/strict'
import {implicitTwoShockMiddleSensitivity} from '../src/math/solution/riemannImplicitMiddleSensitivity.js'
const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:0}
const L=[2,2],M=[0,2],R=[0,0]
test('local two-shock intersection derivative is defined at transverse decoupled shocks',()=>{
 const result=implicitTwoShockMiddleSensitivity(L,M,R,p)
 assert.equal(result.status,'local-implicit-derivative')
 assert.equal(result.rows.length,10)
 assert.ok(result.rows.every(row=>row.derivative.every(Number.isFinite)))
 assert.equal(result.entropyCertified,false)
})
test('common linear diagonal perturbations do not move the intermediate state',()=>{
 const result=implicitTwoShockMiddleSensitivity(L,M,R,p)
 for(const k of ['a10','b01'])assert.ok(Math.hypot(...result.rows.find(r=>r.coefficient===k).derivative)<1e-7)
})
test('rejects points that do not satisfy both Hugoniot equations',()=>{
 assert.equal(implicitTwoShockMiddleSensitivity(L,[.3,1.7],R,p).status,'not-on-both-hugoniot-loci')
})
test('rejects singular intersection without inventing derivatives',()=>{
 const zero=Object.fromEntries(Object.keys(p).map(k=>[k,0]))
 assert.equal(implicitTwoShockMiddleSensitivity(L,M,R,zero).status,'singular-or-ill-conditioned-intersection')
})

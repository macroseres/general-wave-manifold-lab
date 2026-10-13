import test from 'node:test'
import assert from 'node:assert/strict'
import {reciprocalWindowHopfMesh} from '../src/geometry/hopf/reciprocalWindowSurface.js'
import {hopfAtlasAt} from '../src/math/sonic/hopfAtlas.js'
const p={a20:4.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
for(const side of ['minus','plus'])test(`reciprocal Y-window mesh ${side} is finite and on Hopf`,()=>{
 const m=reciprocalWindowHopfMesh(p,{side,nZ:24,nY:64})
 assert.equal(m.kind,'regular');assert.ok(m.indices.length>0)
 for(let i=0;i<m.positions.length;i+=3){const [tau,Y,zc]=m.positions.slice(i,i+3);assert.ok([tau,Y,zc].every(Number.isFinite));assert.ok(tau>=-1.000001&&tau<=1.000001);assert.ok(Y>=-6.000001&&Y<=6.000001);const h=hopfAtlasAt(tau,Y,zc,p,side);assert.equal(h.kind,'regular');assert.ok(Math.abs(h.trace)<1e-5,`trace ${h.trace}`);assert.ok(h.det>-1e-4,`det ${h.det}`)}
})

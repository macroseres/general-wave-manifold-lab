import test from 'node:test'
import assert from 'node:assert/strict'
import {auditCoincidenceIncidence} from '../src/math/characteristic/coincidenceIncidenceAudit.js'
const window={uMin:-2,uMax:2,vMin:-2,vMax:2}
const zero={a20:0,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:0}
test('fluxo nulo sem contorno detectável não inventa levantamentos',()=>{
 const r=auditCoincidenceIncidence(zero,window)
 assert.equal(r.status,'no-contour')
 assert.equal(r.segments,0)
})
test('diagnóstico conserva contagem das amostras',()=>{
 const p={...zero,a20:1,b11:1,b02:1}
 const r=auditCoincidenceIncidence(p,window)
 assert.equal(Object.values(r.counts).reduce((a,b)=>a+b,0),r.segments)
})

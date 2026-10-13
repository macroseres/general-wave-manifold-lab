import test from 'node:test'
import assert from 'node:assert/strict'
import {nearestProjectedSample,projectedHugoniotEndpoints} from '../src/math/state/projectedCurveSamples.js'
test('seleciona amostra existente sem interpolar estados',()=>{
 const curve={points:[{u:1,v:2},{u:3,v:4}],screenPoints:[[0,0],[20,0]]}
 assert.deepEqual(nearestProjectedSample([17,2],curve),{index:1,state:[3,4],distance:Math.hypot(3,2)})
})
test('distingue extremidades para as projeções canônicas',()=>{
 assert.deepEqual(projectedHugoniotEndpoints('plus',[1,2],[3,4]),{left:[1,2],right:[3,4]})
 assert.deepEqual(projectedHugoniotEndpoints('minus',[1,2],[3,4]),{left:[3,4],right:[1,2]})
 assert.equal(projectedHugoniotEndpoints('none',[1,2],[3,4]),null)
})
test('não inventa amostras ausentes',()=>assert.equal(nearestProjectedSample([0,0],{points:[],screenPoints:[]}),null))

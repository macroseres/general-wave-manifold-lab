import test from 'node:test'
import assert from 'node:assert/strict'
import {compareCharacteristicCharts} from '../src/math/manifold/chartConsistency.js'
import {defaultCoefficients} from '../src/math/flux/quadraticFlux.js'
import {classifyRiemannCharacteristicLifts} from '../src/math/characteristic/riemannLifts.js'

test('direção com duas componentes compara ambas as cartas',()=>{
 const U=[0,0], p=defaultCoefficients
 const lifts=classifyRiemannCharacteristicLifts(U,p)
 for(const d of lifts.directions){
   const check=compareCharacteristicCharts(U,d.direction,d.speed,p)
   assert.notEqual(check.status,'invalid')
   if(check.charts.length===2)assert.equal(check.status,'consistent')
 }
})
test('direção axial usa carta válida',()=>{
 const p=defaultCoefficients
 const c=compareCharacteristicCharts([0,0],[1,0],0,p)
 assert.deepEqual(c.charts,['finite'])
})
test('direção nula é inválida',()=>{
 assert.equal(compareCharacteristicCharts([0,0],[0,0],0,defaultCoefficients).status,'invalid')
})

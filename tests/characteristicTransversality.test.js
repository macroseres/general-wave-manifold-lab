import test from 'node:test'
import assert from 'node:assert/strict'
import {characteristicFibreTransversality} from '../src/math/manifold/characteristicTransversality.js'
const linear={a20:0,a11:0,a02:0,a10:1,a01:0,b20:0,b11:0,b02:0,b10:0,b01:2}
test('regular linear fibres cross characteristic boundary in both roles',()=>{
  for(const role of ['forward','backward'])for(const [chart,d,s] of [['finite',0,1],['reciprocal',0,2]]){
    const result=characteristicFibreTransversality([0,0],d,s,linear,role,chart)
    assert.equal(result.classification,'transverse')
    assert.equal(result.fibreRank,4)
    assert.equal(result.boundaryRank,5)
  }
})
test('rejects unknown fibre role',()=>assert.throws(()=>characteristicFibreTransversality([0,0],0,1,linear,'other')))

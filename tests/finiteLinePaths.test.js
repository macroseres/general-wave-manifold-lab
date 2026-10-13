import test from 'node:test'
import assert from 'node:assert/strict'
import { finiteLinePaths } from '../src/rendering/finiteLinePaths.js'

test('non-finite vertices split paths without bridging a gap',()=>{
  const a=[0,0,0], b=[1,0,0], c=[2,0,0], d=[3,0,0]
  assert.deepEqual(finiteLinePaths([a,b,[NaN,0,0],c,d]),[[a,b],[c,d]])
})
test('invalid endpoints and singleton paths are never sent to Three.js',()=>{
  assert.deepEqual(finiteLinePaths([[Infinity,0,0],[0,0,0],[NaN,0,0],[1,0,0]]),[])
})
test('segments mode discards only invalid pairs, preserving pair boundaries',()=>{
  const a=[0,0,0],b=[1,0,0],c=[2,0,0],d=[3,0,0]
  assert.deepEqual(finiteLinePaths([a,b,[NaN,0,0],c,c,d],{segments:true}),[[a,b],[c,d]])
})

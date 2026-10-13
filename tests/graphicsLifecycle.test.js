import test from 'node:test'
import assert from 'node:assert/strict'
import {disposeGeometry,disposeAxesHelper} from '../src/rendering/graphicsLifecycle.js'

test('geometry cleanup handles null and disposes exactly once per call',()=>{
  let count=0
  disposeGeometry(null)
  disposeGeometry({dispose(){count++}})
  assert.equal(count,1)
})

test('axes cleanup releases owned geometry and material',()=>{
  const released=[]
  disposeAxesHelper(null)
  disposeAxesHelper({geometry:{dispose(){released.push('geometry')}},material:{dispose(){released.push('material')}}})
  assert.deepEqual(released,['geometry','material'])
})

test('axes cleanup supports material arrays',()=>{
  const released=[]
  disposeAxesHelper({geometry:{dispose(){released.push('geometry')}},material:[{dispose(){released.push('a')}},{dispose(){released.push('b')}}]})
  assert.deepEqual(released,['geometry','a','b'])
})

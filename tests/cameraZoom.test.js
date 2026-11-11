import test from 'node:test'
import assert from 'node:assert/strict'
import {zoomPositionAroundTarget} from '../src/components/scene/cameraZoom.js'

test('zoom at the origin preserves the previous camera scaling',()=>{
  assert.deepEqual(zoomPositionAroundTarget({x:3,y:3,z:3},undefined,2),{x:6,y:6,z:6})
})

test('zoom after focusing an off-origin sample retains its target and view direction',()=>{
  const position=Object.freeze({x:13,y:-2,z:9})
  const target=Object.freeze({x:10,y:-5,z:6})
  assert.deepEqual(zoomPositionAroundTarget(position,target,.5),{x:11.5,y:-3.5,z:7.5})
  assert.deepEqual(zoomPositionAroundTarget(position,target,2),{x:16,y:1,z:12})
})

test('zoom is reversible around a translated target',()=>{
  const position={x:-8,y:11,z:4},target={x:-12,y:3,z:2}
  const closer=zoomPositionAroundTarget(position,target,.5)
  assert.deepEqual(zoomPositionAroundTarget(closer,target,2),position)
  assert.deepEqual(zoomPositionAroundTarget(position,target,1),position)
})

test('zoom rejects nonpositive, nonfinite, and nonnumeric factors',()=>{
  for(const factor of [0,-1,NaN,Infinity,-Infinity,'2',null,undefined]){
    assert.equal(zoomPositionAroundTarget({x:3,y:3,z:3},{x:1,y:1,z:1},factor),null)
  }
})

test('zoom rejects invalid coordinates and overflow',()=>{
  assert.equal(zoomPositionAroundTarget({x:NaN,y:0,z:0},undefined,2),null)
  assert.equal(zoomPositionAroundTarget({x:0,y:0,z:0},{x:Infinity,y:0,z:0},2),null)
  assert.equal(zoomPositionAroundTarget({x:Number.MAX_VALUE,y:0,z:0},undefined,2),null)
})

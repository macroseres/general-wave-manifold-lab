import test from 'node:test'
import assert from 'node:assert/strict'
import {isCurrentSonicResponse,disposeSonicWorker} from '../src/rendering/sonicWorkerLifecycle.js'

test('accepts only current sonic request and key',()=>{
  assert.equal(isCurrentSonicResponse({id:3,key:'new'},3,'new'),true)
  assert.equal(isCurrentSonicResponse({id:2,key:'new'},3,'new'),false)
  assert.equal(isCurrentSonicResponse({id:3,key:'old'},3,'new'),false)
  assert.equal(isCurrentSonicResponse(null,3,'new'),false)
})
test('worker cleanup detaches all handlers before termination',()=>{
  const events=[]
  const worker={onmessage:()=>{},onerror:()=>{},onmessageerror:()=>{},terminate(){events.push([this.onmessage,this.onerror,this.onmessageerror])}}
  disposeSonicWorker(worker)
  assert.deepEqual(events,[[null,null,null]])
  disposeSonicWorker(null)
})

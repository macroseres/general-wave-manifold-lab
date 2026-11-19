import test from 'node:test'
import assert from 'node:assert/strict'
import {isCurrentSonicResponse,disposeSonicWorker,sonicSurfaceStatus} from '../src/rendering/sonicWorkerLifecycle.js'

test('loading follows the latest case while either sonic surface remains visible',()=>{
  const previous={key:'case-A',state:'ready'}
  for(const [minus,plus] of [[true,true],[true,false],[false,true]]){
    assert.equal(sonicSurfaceStatus(previous,'case-B',minus||plus),'loading')
    assert.equal(sonicSurfaceStatus({key:'case-B',state:'ready'},'case-B',minus||plus),'ready')
  }
  assert.equal(sonicSurfaceStatus({key:'case-B',state:'loading'},'case-B',false),'hidden')
  assert.equal(sonicSurfaceStatus({key:'case-A',state:'error'},'case-B',true),'loading')
  assert.equal(sonicSurfaceStatus({key:'case-B',state:'error'},'case-B',true),'error')
})

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

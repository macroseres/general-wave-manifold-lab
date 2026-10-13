import test from 'node:test'
import assert from 'node:assert/strict'
import {finiteSonicContacts} from '../src/math/solution/finiteSonicContact.js'
const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:0}
const segment=points=>[{points:points.map(([u,v])=>({u,v}))}]
test('forward fixed left tests S+ on right endpoint',()=>{
  const events=finiteSonicContacts([0,0],segment([[.5,0],[1,0],[2,0]]),p,'forward')
  assert.equal(events.length,0) // Burgers shock speed u/2 never equals lambda(right)=u at nonzero jump
})
test('backward fixed right tests S- on left endpoint',()=>{
  const events=finiteSonicContacts([0,0],segment([[.5,0],[1,0],[2,0]]),p,'backward')
  assert.equal(events.length,0)
})
test('missing state yields no candidates',()=>assert.deepEqual(finiteSonicContacts(null,[],p,'forward'),[]))

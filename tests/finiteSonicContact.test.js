import test from 'node:test'
import assert from 'node:assert/strict'
import {finiteSonicContacts} from '../src/math/solution/finiteSonicContact.js'
import {refineFiniteSonicContacts} from '../src/math/solution/refineFiniteSonicContact.js'
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

test('constant contact continua are grouped and never sent to isolated sonic continuation',()=>{
  const linear={...p,a20:0,b02:0,a10:1,b01:2}
  const events=finiteSonicContacts([0,0],segment([[1,0],[2,0],[3,0]]),linear,'forward')
  assert.equal(events.length,1)
  assert.equal(events[0].kind,'constant-contact-continuum')
  assert.equal(events[0].sampleCount,3)
  assert.equal(refineFiniteSonicContacts([0,0],events,linear,'forward')[0].refinement.status,'non-isolated-contact-continuum')
})

test('triangular finite sonic continua across spectral families are not treated as isolated roots',()=>{
  const triangular={...p,b02:0,b01:3}
  for(const [fixed,points,orientation] of [[[1,0],[[5,-.4],[5,0],[5,.7]],'forward'],
    [[2,1],[[4,.95],[4,1.2],[4,2]],'backward']]){
    const events=finiteSonicContacts(fixed,segment(points),triangular,orientation)
    assert.ok(events.length>0)
    const refined=refineFiniteSonicContacts(fixed,events,triangular,orientation)
    assert.ok(refined.every(q=>q.refinement.status==='non-isolated-or-singular-root'))
  }
})

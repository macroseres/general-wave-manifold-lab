import test from 'node:test'
import assert from 'node:assert/strict'
import {oldWavePreset} from '../src/math/flux/quadraticFlux.js'
import {internalCompositeShockLiu} from '../src/math/solution/internalCompositeShockLiu.js'
import {quadraticSonicPartners} from '../src/math/solution/sonicPartners.js'

const p=oldWavePreset({B2:0})
const partner=quadraticSonicPartners([1,-1],p,'slow','left').find(q=>
  Math.hypot(q.point[0]-1,q.point[1]-1)<1e-8)
const block=()=>({type:'K',family:'slow',construction:'rarefaction-shock',
  sonicJunction:[1,-1],segments:[{type:'rarefaction'},
    {type:'shock',family:'slow',sonicSide:'minus',from:[1,-1],to:[1,1]}]})

test('C04-T03: missing connected arc is not Liu approval',()=>{
  assert.ok(partner)
  const result=internalCompositeShockLiu(block(),null,p)
  assert.equal(result.status,'arc-unverified')
  assert.equal(result.entropyCertified,false)
})

test('C04-T03: reversed sonic side is rejected before Liu',()=>{
  const b=block();b.segments[1].sonicSide='plus'
  assert.equal(internalCompositeShockLiu(b,[],p).status,'invalid-block')
})

test('C04-T03: a nonmatching arc endpoint cannot be assigned to K',()=>{
  const result=internalCompositeShockLiu(block(),[[1,-1],[1,0],[2,2]],p)
  assert.equal(result.status,'arc-unverified')
})

test('C04-T03: right K must have plus sonic endpoint and shock-rarefaction orientation',()=>{
  const b=block();b.construction='shock-rarefaction'
  assert.equal(internalCompositeShockLiu(b,[],p).status,'invalid-block')
})

test('C04-T03: invalid or absent K never becomes entropy certified',()=>{
  const result=internalCompositeShockLiu({type:'S'},[],p)
  assert.equal(result.status,'invalid-block')
  assert.equal(result.entropyCertified,false)
})

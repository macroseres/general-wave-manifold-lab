import test from 'node:test'
import assert from 'node:assert/strict'
import {oldWavePreset} from '../src/math/flux/quadraticFlux.js'
import {internalCompositeShockLiu} from '../src/math/solution/internalCompositeShockLiu.js'
import {quadraticSonicPartners} from '../src/math/solution/sonicPartners.js'
import {correctForwardHugoniotPoint} from '../src/math/solution/forwardHugoniotContinuation.js'
import {directShockDiagnostic} from '../src/math/solution/directShockDiagnostic.js'

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

/** A locally corrected intermediate RH point is used rather than a chord
 * interpolation. These tests establish sampled evaluation, not global Liu. */
function sampledArc(fixed,target){
  const seed=fixed.map((v,i)=>(v+target[i])/2)
  const corrected=correctForwardHugoniotPoint(fixed,seed,p)
  assert.equal(corrected.status,'converged')
  const middle=corrected.point
  assert.ok(Math.hypot(...middle.map((v,i)=>v-fixed[i]))>1e-5)
  assert.ok(Math.hypot(...middle.map((v,i)=>v-target[i]))>1e-5)
  assert.equal(directShockDiagnostic(fixed,middle,p).rankineHugoniot,true)
  return [[...fixed],middle,[...target]]
}

test('C04-T03: forward Liu evaluates a corrected RH arc for the KR sonic shock',()=>{
  const b=block(),jump=b.segments[1]
  const arc=sampledArc(jump.from,jump.to)
  const result=internalCompositeShockLiu(b,arc,p)
  assert.equal(result.direction,'forward')
  assert.equal(result.checked,1)
  assert.ok(['no-sampled-violation','liu-violation-detected'].includes(result.status))
  assert.equal(result.entropyCertified,false)
})

test('C04-T03: backward Liu evaluates a corrected RH arc for the RK sonic shock',()=>{
  const junction=[(1-Math.sqrt(71))/7,0],middle=[-1,-1]
  const b={type:'K',family:'fast',construction:'shock-rarefaction',
    sonicJunction:junction,segments:[{type:'shock',family:'fast',
      sonicSide:'plus',from:middle,to:junction},{type:'rarefaction'}]}
  const arc=sampledArc(junction,middle)
  const result=internalCompositeShockLiu(b,arc,p)
  assert.equal(result.direction,'backward')
  assert.equal(result.checked,1)
  assert.ok(['no-sampled-violation','liu-violation-detected'].includes(result.status))
  assert.equal(result.entropyCertified,false)
})

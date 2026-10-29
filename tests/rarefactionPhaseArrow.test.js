import test from 'node:test'
import assert from 'node:assert/strict'
import {rarefactionPhaseArrow,rarefactionPhasePoints} from '../src/geometry/state/rarefactionPhaseArrow.js'
import {finiteRarefactionSeparatrices} from '../src/math/rarefaction/finiteSeparatrices.js'
import {infinityRarefactionSeparatrices} from '../src/math/rarefaction/separatrices.js'
import {oldWavePreset} from '../src/math/flux/quadraticFlux.js'
import {rarefactionField,rarefactionDirectionResidual} from '../src/math/rarefaction/field.js'
import {zFromZc} from '../src/math/charts/zChart.js'

const saddle={a20:.1343645781182241,a11:-.7297449434335905,a02:.30032803661043106,a10:-.3478441614460568,a01:-.12068521462094717,
  b20:.5562426790359116,b11:.27141191531855213,b02:.4162423170929892,b10:-.49116961019312644,b01:-.8931050358479689}
const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0)

test('finite stable and unstable arrows follow the field rather than outward stored order',()=>{
  const data=finiteRarefactionSeparatrices(saddle,-3,3,{maxSteps:100})
  assert.ok(data.separatrices.some(q=>q.stable))
  assert.ok(data.separatrices.some(q=>!q.stable))
  for(const curve of data.separatrices){
    const rendered=rarefactionPhasePoints(curve.points,.043)
    assert.equal(rendered.length,curve.points.length)
    assert.ok(rendered.every((q,i)=>q.every(Number.isFinite)&&q[0]===curve.points[i].tau&&q[1]===.043&&q[2]===curve.points[i].zc))
    const i=Math.floor(curve.points.length*.4),arrow=rarefactionPhaseArrow(curve.points,i,saddle)
    assert.ok(arrow)
    const v=rarefactionField(arrow.point.tau,zFromZc(arrow.point.zc),saddle)
    assert.ok(dot(arrow.direction,[v.tauDot,0,v.zcDot])>0)
    const a=curve.points[i-1],b=curve.points[i+1]
    assert.equal(dot(arrow.direction,[b.tau-a.tau,0,b.zc-a.zc])>0,!curve.stable)
    const reversed=[...curve.points].reverse()
    assert.deepEqual(rarefactionPhaseArrow(reversed,reversed.length-1-i,saddle),arrow)
    assert.ok(rarefactionDirectionResidual(arrow.point.tau,zFromZc(arrow.point.zc),saddle)<1e-8)
  }
})

test('reciprocal separatrix arrows handle opposite time orientation on the two sides of infinity',()=>{
  const p=oldWavePreset({B2:0})
  const curves=infinityRarefactionSeparatrices(p,{tauMin:-5,tauMax:5}).filter(q=>q.visibleInFiniteChart)
  assert.equal(curves.length,2)
  const alignments=[]
  for(const curve of curves){
    const rendered=rarefactionPhasePoints(curve.points,.062)
    assert.ok(rendered.every((q,i)=>q.every(Number.isFinite)&&q[0]===curve.points[i].tau&&q[1]===.062&&q[2]===curve.points[i].zc))
    const i=Math.floor(curve.points.length*.4),arrow=rarefactionPhaseArrow(curve.points,i,p)
    assert.ok(arrow)
    const a=curve.points[i-1],b=curve.points[i+1],v=rarefactionField(arrow.point.tau,zFromZc(arrow.point.zc),p)
    assert.ok(dot(arrow.direction,[v.tauDot,0,v.zcDot])>0)
    alignments.push(dot(arrow.direction,[b.tau-a.tau,0,b.zc-a.zc])>0)
  }
  assert.deepEqual(alignments.sort(),[false,true])
})

test('invalid or degenerate display positions do not produce arrows',()=>{
  const p=oldWavePreset()
  assert.equal(rarefactionPhaseArrow([],0,p),null)
  assert.equal(rarefactionPhaseArrow(Array(4).fill({tau:0,zc:1}),1,p),null)
})

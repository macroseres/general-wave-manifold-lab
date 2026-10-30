import test from 'node:test'
import assert from 'node:assert/strict'
import {seededRarefactionCurves} from '../src/geometry/state/seededRarefactionCurves.js'
import {rarefactionOrbitThrough} from '../src/math/rarefaction/orbits.js'
import {rarefactionField,rarefactionDirectionResidual} from '../src/math/rarefaction/field.js'
import {zFromZc} from '../src/math/charts/zChart.js'
import {oldWavePreset} from '../src/math/flux/quadraticFlux.js'
import {rhResidual,waveState} from '../src/math/manifold/waveState.js'
import {rarefactionPhasePoints} from '../src/geometry/state/rarefactionPhaseArrow.js'

const p=oldWavePreset({B2:0}),states={left:[.4895,-.3109],right:[.7063,.7984]}

test('seeded integral curves pass through the exact slow-forward and fast-backward reference points',()=>{
  const curves=seededRarefactionCurves(states,p,-2,2).filter(q=>!['composite','nonlocal'].includes(q.kind))
  assert.deepEqual(curves.map(q=>q.family),['slow','slow','fast'])
  for(const curve of curves){
    const matches=curve.points.flatMap((q,i)=>q.tau===curve.seed.tau&&q.zc===curve.seed.zc?[i]:[])
    assert.equal(matches.length,1)
    const index=matches[0]
    assert.deepEqual(rarefactionPhasePoints(curve.points)[index],[curve.seed.tau,0,curve.seed.zc])
    if(curve.family==='slow'&&curve.kind!=='full')assert.equal(index,0)
    else assert.ok(index>0&&index<curve.points.length-1)
    const U=waveState(curve.seed.tau,0,zFromZc(curve.seed.zc),p).Um
    const expected=curve.family==='slow'?states.left:states.right
    assert.ok(Math.hypot(...U.map((v,i)=>v-expected[i]))<1e-9)
    const before=curve.points[Math.max(0,index-1)],after=curve.points[index+1]
    const field=rarefactionField(curve.seed.tau,zFromZc(curve.seed.zc),p)
    assert.ok(((after.tau-before.tau)*field.tauDot+(after.zc-before.zc)*field.zcDot)*(curve.timeDirection??1)>0)
    for(const q of curve.points){
      assert.ok([q.tau,q.zc].every(Number.isFinite))
      assert.ok(Number.isFinite(q.tau)&&Math.abs(q.zc)<.997)
      assert.ok(rarefactionDirectionResidual(q.tau,zFromZc(q.zc),p)<1e-8)
    }
  }
})

test('missing anchors and seeds outside the computational window do not generate substitute curves',()=>{
  assert.deepEqual(seededRarefactionCurves({},p,-2,2),[])
  assert.deepEqual(rarefactionOrbitThrough({tau:4,zc:0},p,-2,2),[])
  assert.deepEqual(rarefactionOrbitThrough({tau:0,zc:NaN},p,-2,2),[])
})


test('Ks begins at inflection, remains on the forward sonic saturation and inherits decreasing speeds',()=>{
  const curves=seededRarefactionCurves({left:[.5,-1]},p,-2,2),arc=curves[0],ks=curves.find(q=>q.kind==='composite')
  assert.ok(ks?.complete)
  assert.equal(ks.points[0].tau,arc.points.at(-1).tau)
  assert.equal(ks.points[0].Y,0)
  assert.equal(ks.points[0].zc,arc.points.at(-1).zc)
  assert.equal(ks.points[0].speed,arc.speeds.at(-1))
  assert.ok(ks.points.length>3)
  for(let i=1;i<ks.points.length;i++){
    const q=ks.points[i],state=waveState(q.tau,q.Y,zFromZc(q.zc),p),source=waveState(q.source.tau,0,zFromZc(q.source.zc),p)
    assert.ok(q.certificate.valid)
    assert.ok(Math.abs(state.s-source.s)<1e-7)
    assert.ok(Math.abs(q.speed-source.s)<1e-12)
    assert.ok(q.speed<ks.points[i-1].speed)
  }
})


test('nonlocal shock starts exactly at the verified composite endpoint and decreases speed on forward UL Hugoniot',()=>{
  const curves=seededRarefactionCurves({left:[.5,-1]},p,-2,2),ks=curves.find(q=>q.kind==='composite'),shock=curves.find(q=>q.kind==='nonlocal')
  assert.ok(shock?.points.length>10)
  assert.deepEqual(shock.points[0],ks.points.at(-1))
  assert.deepEqual(shock.junction,ks.points.at(-1))
  for(let i=0;i<shock.points.length;i++){
    const q=shock.points[i],w=waveState(q.tau,q.Y,zFromZc(q.zc),p)
    assert.ok(Math.hypot(...w.Um.map((v,j)=>v-shock.sourceState[j]))<1e-8)
    assert.ok(rhResidual(w,p)<1e-7)
    assert.ok(Math.abs(w.s-q.speed)<1e-7)
    if(i)assert.ok(q.speed<shock.points[i-1].speed)
  }
})


test('surface tau window does not truncate integral curves, inflection endpoints, composites or nonlocal shocks',()=>{
  const states={left:[.5,-1],right:[-.5,1]},narrow=seededRarefactionCurves(states,p,.49,.50),wide=seededRarefactionCurves(states,p,-2,2)
  assert.deepEqual(narrow,wide)
  const arc=narrow.find(q=>q.family==='slow'&&!q.kind)
  assert.ok(arc.complete)
  assert.ok(arc.points.at(-1).tau>.5)
  const ks=narrow.find(q=>q.kind==='composite')
  assert.ok(ks.complete)
  assert.equal(ks.points[0].tau,arc.points.at(-1).tau)
  for(const curve of narrow)assert.ok(curve.points.some(q=>q.tau<.49||q.tau>.5))
})

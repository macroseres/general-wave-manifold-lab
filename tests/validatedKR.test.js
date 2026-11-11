import test from 'node:test'
import assert from 'node:assert/strict'
import * as I from '../src/math/numerics/outwardInterval.js'
import {validatedScalarFlow} from '../src/math/numerics/intervalTaylor.js'
import {validatedKR} from '../src/math/solution/validatedKR.js'
import {chainExamples} from '../src/experiment/chainExamples.js'
import {constructionRarefactionBranches} from '../src/math/solution/stateConstructionSampling.js'
import {compositeBlockChainCandidates} from '../src/math/solution/compositeBlockChainCandidates.js'
import {candidateStateGeometry} from '../src/geometry/state/candidateStateGeometry.js'
import {classifyWaveChain} from '../src/math/solution/waveChainClassification.js'
import {assessWaveChain} from '../src/math/solution/waveChainAssessment.js'
import {riemannCertificationReport} from '../src/math/solution/riemannCertificationReport.js'

test('outward arithmetic encloses cancellation, signs and division, and rejects poles',()=>{
  const small=2**-54
  assert.ok(I.add(I.interval(1),I.interval(small))[1]>1)
  assert.ok(I.add(I.interval(-1),I.interval(-small))[0]<-1)
  assert.ok(I.contains(I.mul([-2,3],[-4,5]),[-12,15]))
  assert.ok(I.contains(I.div([2,4],[-4,-2]),[-2,-.5]))
  assert.throws(()=>I.div([1,1],[-1,1]))
  assert.throws(()=>I.sqrt([-1,1]))
})

test('Taylor enclosure covers exact scalar flows forward and backward',()=>{
  for(const target of [-.1,.1]){
    const flow=validatedScalarFlow((A,t,y)=>y,0,1,target,{step:.01})
    assert.ok(I.contains(flow.value,I.interval(Math.exp(target))))
    assert.ok(flow.value[1]-flow.value[0]<1e-8)
  }
  const flow=validatedScalarFlow((A,t)=>A.mul(A.constant(2),t),0,0,.1)
  assert.ok(I.contains(flow.value,I.interval(.01)))
  assert.ok(I.contains(flow.sampleAt(.05),I.interval(.0025)))
})

const example=chainExamples.find(q=>q.pattern==='KR')
const p=example.coefficients
const candidate=compositeBlockChainCandidates(example.states,
  constructionRarefactionBranches(example.states,p),{left:[],right:[]},p).find(q=>q.pattern==='KR')

test('KR has a validated root, continuous fans, Liu and self-similar assembly',()=>{
  const proof=validatedKR(candidate,p)
  assert.equal(proof.status,'validated',proof.reason)
  assert.ok(proof.slow.minimumDelta>0)
  assert.ok(proof.fast.minimumDelta>0)
  assert.ok(proof.slow.minimumGrowth>0)
  assert.ok(proof.fast.minimumGrowth>0)
  assert.ok(proof.liu.factorUpperBound<0)
  assert.ok(proof.contraction<1)
  assert.ok(proof.minimumWaveGap>3)
  assert.ok(proof.middleStateError<1e-5)
  assert.ok(proof.maximumSampleError<1e-6)
  assert.equal(proof.selfSimilarAssembly,'validated')
  const classification=classifyWaveChain(candidate,p,candidateStateGeometry(candidate,p))
  assert.equal(classification.waves[1].admissibility.liu.status,'validated-liu')
  assert.equal(assessWaveChain(classification).status,'validated')
  assert.deepEqual(riemannCertificationReport(candidate,classification,p).pending,[])
})

test('a certificate is invalidated by altered data, junctions, waves or speeds',()=>{
  for(const change of [
    q=>{q.left[0]=1},
    q=>{q.segments[1].speed+=1},
    q=>{q.segments[1].from[0]+=.1},
    q=>{q.segments[0].states[3][0]+=.1},
    q=>{q.segments[1].sonicSide='plus'},
  ]){
    const altered=structuredClone(candidate)
    change(altered)
    assert.equal(validatedKR(altered,p).status,'unresolved')
  }
  const modified={...p,a20:p.a20+.2}
  assert.equal(validatedKR(candidate,modified).status,'unresolved')
  assert.equal(validatedKR(candidate,p).status,'validated')
})

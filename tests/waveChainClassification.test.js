import {readFileSync} from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {traditionalShockSignatures} from '../scripts/traditional-shock-signatures.mjs'
import {classifyWaveChain} from '../src/math/solution/waveChainClassification.js'

const burgers={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:5}

test('C01: nine quadratic RH configurations remain distinguishable without entropy certification',()=>{
  for(const q of traditionalShockSignatures()){
    const candidate={status:'sampled-candidate',kind:'composite-chain',
      segments:[{type:'shock',family:'slow',from:q.left,to:q.right,speed:q.speed}]}
    const result=classifyWaveChain(candidate,q.coefficients)
    assert.equal(result.waves[0].spectral.name,q.name)
    assert.equal(result.waves[0].incoming,q.incoming)
    assert.equal(result.waves[0].conservation.status,'numerically-compatible')
    assert.equal(result.entropyCertified,false)
    assert.equal(result.waves[0].admissibility.viscousProfile.status,'not-evaluated')
  }
})

test('C01: a detected Liu violation is retained without removing the candidate',()=>{
  const candidate={status:'sampled-candidate',kind:'shock-rarefaction',
    left:[2,0],middle:[0,0],right:[0,1],shockSpeed:1,
    fanStates:[[0,0],[0,1]],fanSpeeds:[5,6],
    evidence:{status:'liu-violation-detected',liu:'liu-violation-detected'}}
  const result=classifyWaveChain(candidate,burgers)
  assert.equal(result.waves.length,2)
  assert.equal(result.waves[0].admissibility.liu.status,'sampled-violation-detected')
  assert.equal(result.admissibility.status,'sampled-violation-detected')
  assert.equal(result.entropyCertified,false)
})

test('C01: strict Lax labels are not inferred for contacts',()=>{
  const candidate={status:'sampled-candidate',kind:'contact-chain',middle:[0,0],
    segments:[{type:'contact',from:[0,0],to:[0,1],family:'fast',speed:5}]}
  const result=classifyWaveChain(candidate,burgers)
  assert.equal(result.waves[0].admissibility.lax.status,'not-established')
  assert.equal(result.entropyCertified,false)
})

test('C01: sonic and degenerate spectra are not forced into nine strict classes',()=>{
  const sonic={status:'sampled-candidate',kind:'composite-chain',
    segments:[{type:'shock',from:[2,0],to:[0,0],speed:1}]}
  const sonicResult=classifyWaveChain(sonic,{...burgers,b01:1})
  assert.equal(sonicResult.waves[0].spectral.kind,'sonic-boundary')
  assert.equal(sonicResult.waves[0].admissibility.lax.status,'not-established')
  assert.equal(sonicResult.entropyCertified,false)
  const degenerateResult=classifyWaveChain(sonic,{...burgers,b01:0})
  assert.equal(degenerateResult.waves[0].spectral.kind,'non-strict-hyperbolicity')
  assert.equal(degenerateResult.waves[0].admissibility.lax.status,'not-established')
  assert.equal(degenerateResult.entropyCertified,false)
  const empty=classifyWaveChain({status:'inconclusive'},burgers)
  assert.equal(empty.construction.status,'inconclusive')
  assert.equal(empty.weakSolution.status,'unverified')
})

test('C01: RR has no RH jump and remains an uncertified numerical candidate',()=>{
  const q={status:'sampled-candidate',kind:'two-rarefaction',fans:[
    {states:[[0,0],[0,1]],speeds:[0,1],family:'slow'},
    {states:[[0,1],[1,1]],speeds:[2,3],family:'fast'}]}
  const result=classifyWaveChain(q,burgers)
  assert.equal(result.waves.length,2)
  assert.equal(result.weakSolution.status,'not-applicable')
  assert.equal(result.waves[0].fan.status,'sampled-speed-ordered')
  assert.equal(result.entropyCertified,false)
})

test('C01: declared shock speed must satisfy RH, not only fitted endpoint speed',()=>{
  const candidate={status:'sampled-candidate',kind:'composite-chain',
    segments:[{type:'shock',family:'slow',from:[2,0],to:[0,0],speed:2}]}
  const result=classifyWaveChain(candidate,burgers)
  assert.equal(result.waves[0].conservation.status,'unverified')
  assert.ok(result.waves[0].conservation.relativeResidual>1e-8)
  assert.equal(result.weakSolution.status,'unverified')
  assert.equal(result.entropyCertified,false)
  const corrected=classifyWaveChain({...candidate,segments:[{...candidate.segments[0],speed:1}]},burgers)
  assert.equal(corrected.waves[0].conservation.status,'numerically-compatible')
})

test('C01: adjacent waves diagnose continuity and global speed ordering independently',()=>{
  const segments=[
    {type:'shock',from:[2,0],to:[0,0],speed:1},
    {type:'rarefaction',from:[0,0],to:[0,1],speeds:[5,6]},
  ]
  const classify=items=>classifyWaveChain({status:'sampled-candidate',kind:'composite-chain',segments:items},burgers)
  const valid=classify(segments)
  assert.equal(valid.chainGeometry.continuity.status,'numerically-compatible')
  assert.equal(valid.chainGeometry.speedOrdering.status,'numerically-compatible')
  const gap=classify([segments[0],{...segments[1],from:[0.1,0]}])
  assert.equal(gap.chainGeometry.continuity.status,'violation-detected')
  assert.equal(gap.chainGeometry.speedOrdering.status,'numerically-compatible')
  const reversed=classify([{...segments[0],speed:7},segments[1]])
  assert.equal(reversed.chainGeometry.continuity.status,'numerically-compatible')
  assert.equal(reversed.chainGeometry.speedOrdering.status,'violation-detected')
  const unknown=classify([segments[0],{...segments[1],speeds:[]}])
  assert.equal(unknown.chainGeometry.speedOrdering.status,'unverified')
  assert.equal(valid.entropyCertified,false)
})

test('C02-T01: both inspection panels receive coefficients and display uniform diagnostics without changing selection',()=>{
  const inspection=readFileSync(new URL('../src/components/StateChainInspection.jsx',import.meta.url),'utf8')
  const workspace=readFileSync(new URL('../src/components/StateSpaceDialog.jsx',import.meta.url),'utf8')
  assert.match(inspection,/classifyWaveChain\(candidate,p\)/)
  assert.match(inspection,/classification\.chainGeometry\.continuity\.status/)
  assert.match(inspection,/classification\.chainGeometry\.speedOrdering\.status/)
  assert.match(inspection,/classification\.waves\.map/)
  assert.match(inspection,/sem prova distribucional ou certificação de entropia/)
  assert.match(workspace,/<StateChainInspection candidate=\{activeProfile\} geometry=\{chainGeometry\} p=\{p\}/)
  assert.match(workspace,/<StateChainInspection candidate=\{comparisonProfile\} geometry=\{comparisonGeometry\} p=\{p\}/)
})

test('C02-T02: uniform diagnostics remain individually labeled in narrow panels',()=>{
  const inspection=readFileSync(new URL('../src/components/StateChainInspection.jsx',import.meta.url),'utf8')
  for(const label of ['Conservação','Continuidade','Velocidades globais','Espectro:','Lax:','Liu:','Perfil viscoso:']){
    assert.ok(inspection.includes(label),`missing diagnostic label: ${label}`)
  }
  assert.match(inspection,/overflowWrap:'anywhere'/)
  assert.match(inspection,/classification\.waves\.map/)
  assert.match(inspection,/classifyWaveChain\(candidate,p\)/)
})

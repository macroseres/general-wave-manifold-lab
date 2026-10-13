import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')

function jsFiles(dir){
  const out=[]
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,entry.name)
    if(entry.isDirectory())out.push(...jsFiles(p))
    else if(/\.[cm]?[jt]sx?$/.test(entry.name))out.push(p)
  }
  return out
}

function forbiddenImports(dir){
  const forbidden=/\b(?:from\s*|import\s*\(\s*)['"](?:react(?:\/[^'"]*)?|three(?:\/[^'"]*)?|@react-three\/[^'"]+)['"]/g
  return jsFiles(dir).flatMap(file=>{
    const text=fs.readFileSync(file,'utf8')
    return [...text.matchAll(forbidden)].map(m=>({file:path.relative(root,file),specifier:m[0]}))
  })
}

test('math layer is independent of React and Three.js',()=>{
  assert.deepEqual(forbiddenImports(path.join(root,'src','math')),[])
})

test('geometry layer is independent of React and Three.js',()=>{
  assert.deepEqual(forbiddenImports(path.join(root,'src','geometry')),[])
})

import { NUMERICAL_POLICY, numericalPolicySnapshot } from '../src/math/numerics/policy.js'

test('numerical policy separates tolerances by semantic role',()=>{
  assert.notEqual(NUMERICAL_POLICY.algebra.regularityTolerance, undefined)
  assert.notEqual(NUMERICAL_POLICY.spectrum.coincidenceEventRelativeTolerance, undefined)
  assert.notEqual(NUMERICAL_POLICY.rarefaction.orbitStep, undefined)
  assert.notEqual(NUMERICAL_POLICY.rarefaction.adaptiveAbsoluteTolerance, undefined)
  assert.notEqual(NUMERICAL_POLICY.rarefaction.adaptiveRelativeTolerance, undefined)
  assert.notEqual(NUMERICAL_POLICY.rarefaction.adaptiveMinStep, undefined)
  assert.notEqual(NUMERICAL_POLICY.rarefaction.orbitStagnationTolerance, undefined)
  assert.notEqual(NUMERICAL_POLICY.charts.reciprocalBoundaryTolerance, undefined)
  assert.notEqual(NUMERICAL_POLICY.sonic.determinantTolerance, undefined)
})

test('numerical policy snapshot is serializable and detached',()=>{
  const snapshot=numericalPolicySnapshot()
  assert.deepEqual(snapshot,NUMERICAL_POLICY)
  snapshot.rarefaction.orbitStep=999
  assert.notEqual(snapshot.rarefaction.orbitStep,NUMERICAL_POLICY.rarefaction.orbitStep)
  assert.doesNotThrow(()=>JSON.stringify(snapshot))
})

test('Scene renderer does not integrate ODEs or evaluate sonic equations directly',()=>{
  const scene=fs.readFileSync(path.join(root,'src','components','Scene.jsx'),'utf8')
  for(const forbidden of ['rarefactionField(', 'sonicData(', 'rk4Step(', 'zFromZc(']){
    assert.equal(scene.includes(forbidden),false,`Scene.jsx still contains scientific operation ${forbidden}`)
  }
})

import { createExperiment, parseExperiment, validateExperiment, numericalPolicyMatchesCurrent } from '../src/experiment/schema.js'

test('experiment schema round-trips scientific and presentation state',()=>{
  const experiment=createExperiment({appVersion:'0.7.0-dev.17',coefficients:{a20:1,a11:2,a02:3,a10:4,a01:5,b20:6,b11:7,b02:8,b10:9,b01:10},samplingDomain:{tauMin:-2,tauMax:3,YMin:-4,YMax:5},point:{tau:.2,Y:-.3,zc:.4},visibility:{showSMinus:true,showSPlus:false,showRarefaction:true,showRareCurves:true,showFiniteStable:false,showFiniteUnstable:true,showInfinityStable:true,showInfinityUnstable:false},axisScale:{tau:1,Y:.5,zc:2}})
  const parsed=parseExperiment(JSON.stringify(experiment))
  assert.deepEqual(parsed,experiment)
  assert.equal(numericalPolicyMatchesCurrent(parsed),true)
})

test('experiment validation rejects unknown schema and invalid scientific domains',()=>{
  const base=createExperiment({appVersion:'x',coefficients:{a20:1,a11:0,a02:0,a10:0,a01:0,b20:0,b11:1,b02:0,b10:0,b01:0},samplingDomain:{tauMin:-1,tauMax:1,YMin:-1,YMax:1},point:{tau:0,Y:0,zc:0},visibility:{showSMinus:true,showSPlus:true,showRarefaction:true,showRareCurves:true,showFiniteStable:true,showFiniteUnstable:true,showInfinityStable:true,showInfinityUnstable:true},axisScale:{tau:1,Y:1,zc:1}})
  assert.throws(()=>validateExperiment({...base,schemaVersion:99}),/schema/i)
  const bad=structuredClone(base);bad.scientific.samplingDomain.tauMax=bad.scientific.samplingDomain.tauMin
  assert.throws(()=>validateExperiment(bad),/tauMin/)
})

test('experiment numerical policy detects reproducibility mismatch',()=>{
  const base=createExperiment({appVersion:'x',coefficients:{a20:1,a11:0,a02:0,a10:0,a01:0,b20:0,b11:1,b02:0,b10:0,b01:0},samplingDomain:{tauMin:-1,tauMax:1,YMin:-1,YMax:1},point:{tau:0,Y:0,zc:0},visibility:{showSMinus:true,showSPlus:true,showRarefaction:true,showRareCurves:true,showFiniteStable:true,showFiniteUnstable:true,showInfinityStable:true,showInfinityUnstable:true},axisScale:{tau:1,Y:1,zc:1}})
  base.scientific.numericalPolicy.rarefaction.orbitStep*=2
  assert.equal(numericalPolicyMatchesCurrent(base),false)
})


test('experiment schema v1 migrates domain to samplingDomain without changing values',()=>{
  const current=createExperiment({appVersion:'x',coefficients:{a20:1,a11:0,a02:0,a10:0,a01:0,b20:0,b11:1,b02:0,b10:0,b01:0},samplingDomain:{tauMin:-2,tauMax:3,YMin:-4,YMax:5},point:{tau:0,Y:0,zc:0},visibility:{showSMinus:true,showSPlus:true,showRarefaction:true,showRareCurves:true,showFiniteStable:true,showFiniteUnstable:true,showInfinityStable:true,showInfinityUnstable:true},axisScale:{tau:1,Y:1,zc:1}})
  const legacy=structuredClone(current);legacy.schemaVersion=1;legacy.scientific.domain=legacy.scientific.samplingDomain;delete legacy.scientific.samplingDomain
  const migrated=validateExperiment(legacy)
  assert.equal(migrated.schemaVersion,3)
  assert.deepEqual(migrated.scientific.samplingDomain,current.scientific.samplingDomain)
  assert.equal('domain' in migrated.scientific,false)
})


test('canonical mathematical reference includes the pre-Hugoniot closure chapter',()=>{
  const main=fs.readFileSync(path.join(root,'docs','mathematics','main.tex'),'utf8')
  const closure=fs.readFileSync(path.join(root,'docs','mathematics','08-canonical-status.tex'),'utf8')
  assert.match(main,/\\input\{08-canonical-status\}/)
  for(const token of ['\\mathcal W','\\mathcal C','\\mathcal E','\\mathcal S^-','\\mathcal S^+','\\mathcal U','\\mathcal X'])assert.equal(closure.includes(token),true,`canonical closure is missing ${token}`)
})

test('traceability reflects resolved renderer debt and completed adaptive numerics',()=>{
  const trace=fs.readFileSync(path.join(root,'docs','architecture','TRACEABILITY.md'),'utf8')
  assert.match(trace,/geometry\/sonic\/surface\.js/)
  assert.match(trace,/math\/rarefaction\/finiteSeparatrices\.js/)
  assert.match(trace,/adaptive RK4 \+ event refinement implemented in dev\.19/i)
  assert.equal(trace.includes('mesh currently sampled in `Scene.jsx`'),false)
  assert.equal(trace.includes('finite separatrices are still reintegrated in `Scene.jsx`'),false)
})

test('foundation verification has no blocking FAIL and covers commitments 1 through 7',()=>{
  const audit=fs.readFileSync(path.join(root,'docs','architecture','FOUNDATION_VERIFICATION.md'),'utf8')
  for(let i=1;i<=7;i++) assert.match(audit,new RegExp(`\\| ${i} \\|`))
  assert.match(audit,/No blocking FAIL remains/)
  assert.doesNotMatch(audit,/\| \*\*FAIL\*\* \|/)
})

test('canonical LaTeX includes the executable three-space chapter',()=>{
  const main=fs.readFileSync(path.join(root,'docs','mathematics','main.tex'),'utf8')
  assert.match(main,/\\input\{09-three-spaces\}/)
})

test('current documentation recognizes dev.20 physical rarefaction view',()=>{
  const trace=fs.readFileSync(path.join(root,'docs','architecture','TRACEABILITY.md'),'utf8')
  const manual=fs.readFileSync(path.join(root,'docs','user-manual','01-spaces-and-views.md'),'utf8')
  assert.match(trace,/Physical rarefaction realization in `\(x,t\)`/)
  assert.match(trace,/rarefactionSolution\.js/)
  assert.match(manual,/Physical space — implemented rarefaction view/)
  assert.doesNotMatch(manual,/Physical space — planned view/)
})

test('Hugoniot closure audit has no blocking FAIL and keeps composites/Liu deferred',()=>{
  const audit=fs.readFileSync(path.join(root,'docs/architecture/HUGONIOT_VERIFICATION.md'),'utf8')
  assert.match(audit,/fixed-state Hugoniot block has no blocking FAIL/i)
  assert.match(audit,/Liu\/general shock admissibility[\s\S]*DEFERRED/)
  assert.match(audit,/General Riemann solver[\s\S]*DEFERRED/)
  const main=fs.readFileSync(path.join(root,'docs/mathematics/main.tex'),'utf8')
  assert.match(main,/\\input\{11-hugoniot\}/)
})


test('sonic rendering and public sonic API never solve the surface as Y(tau,z)',()=>{
  const surface=fs.readFileSync(path.join(root,'src/geometry/sonic/surface.js'),'utf8')
  const sonic=fs.readFileSync(path.join(root,'src/math/sonic/sonic.js'),'utf8')
  assert.doesNotMatch(surface,/yMinus|yPlus|\/\s*d\.detM|\/\s*detM/)
  assert.doesNotMatch(sonic,/yMinus|yPlus/)
  // The renderer may evaluate the canonical implicit equation through cached
  // sonicData coefficients. It must not reconstruct the surface as Y(tau,z).
  assert.match(surface,/sonicData/)
  assert.match(surface,/Y\s*\*\s*(?:b\.)?detM/)
  assert.match(surface,/K/)
})

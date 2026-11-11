import test from 'node:test'
import assert from 'node:assert/strict'
import {createExperiment,validateExperiment} from '../src/experiment/schema.js'
const coefficients=Object.fromEntries(['a20','a11','a02','a10','a01','b20','b11','b02','b10','b01'].map(k=>[k,0]))
const visibility=Object.fromEntries(['showSMinus','showSPlus','showRarefaction','showRareCurves','showFiniteStable','showFiniteUnstable','showInfinityStable','showInfinityUnstable'].map(k=>[k,false]))
const args={appVersion:'test',coefficients,samplingDomain:{tauMin:-1,tauMax:1,YMin:-1,YMax:1},point:{tau:0,Y:0,zc:0},visibility,axisScale:{tau:1,Y:1,zc:1}}
test('Riemann states roundtrip, including absent right state',()=>{
 const experiment=createExperiment({...args,riemannStates:{left:[1.25,-2],right:null}})
 assert.deepEqual(validateExperiment(experiment).scientific.riemannStates,{left:[1.25,-2],right:null})
})
test('legacy v2 experiments migrate with unplaced states',()=>{
 const legacy=createExperiment(args);legacy.schemaVersion=2;delete legacy.scientific.riemannStates
 assert.deepEqual(validateExperiment(legacy).scientific.riemannStates,{left:null,right:null})
})
test('invalid state coordinates are rejected',()=>{
 const experiment=createExperiment(args);experiment.scientific.riemannStates.left=[Infinity,0]
 assert.throws(()=>validateExperiment(experiment),/número finito/)
})

const additionalVisibility=['showDS','showJ','showKMinus','showKPlus']
test('experiment v4 preserves double-sonic, inflection, and composite visibility',()=>{
 for(const key of additionalVisibility){
  const experiment=createExperiment({...args,visibility:{...visibility,[key]:true}})
  const restored=validateExperiment(JSON.parse(JSON.stringify(experiment)))
  assert.equal(restored.schemaVersion,4)
  assert.equal(restored.presentation.visibility[key],true)
  for(const other of additionalVisibility.filter(name=>name!==key))assert.equal(restored.presentation.visibility[other],false)
 }
})
test('legacy v3 visibility migrates to explicit hidden defaults without mutating input',()=>{
 const legacy=createExperiment({...args,riemannStates:{left:[1,2],right:[3,4]}})
 legacy.schemaVersion=3
 for(const key of additionalVisibility)delete legacy.presentation.visibility[key]
 const original=structuredClone(legacy),restored=validateExperiment(legacy)
 assert.deepEqual(legacy,original)
 for(const key of additionalVisibility)assert.equal(restored.presentation.visibility[key],false)
 assert.deepEqual(restored.scientific,legacy.scientific)
})
test('legacy visibility values are retained when supplied and malformed values rejected',()=>{
 const legacy=createExperiment(args);legacy.schemaVersion=3;legacy.presentation.visibility.showDS=true
 assert.equal(validateExperiment(legacy).presentation.visibility.showDS,true)
 for(const key of additionalVisibility){
  const invalid=createExperiment(args);invalid.presentation.visibility[key]='true'
  assert.throws(()=>validateExperiment(invalid),/booleano/)
  delete invalid.presentation.visibility[key]
  assert.throws(()=>validateExperiment(invalid),/ausente/)
 }
})

test('export does not silently normalize invalid visibility values',()=>{
 for(const key of additionalVisibility)for(const value of [null,0,'true']){
  const experiment=createExperiment({...args,visibility:{...visibility,[key]:value}})
  assert.throws(()=>validateExperiment(experiment),/booleano/)
 }
})
test('legacy v1 and v2 files without the four new controls import with hidden defaults',()=>{
 for(const version of [1,2]){
  const legacy=createExperiment(args);legacy.schemaVersion=version
  delete legacy.scientific.riemannStates
  if(version===1){legacy.scientific.domain=legacy.scientific.samplingDomain;delete legacy.scientific.samplingDomain}
  for(const key of additionalVisibility)delete legacy.presentation.visibility[key]
  const restored=validateExperiment(legacy)
  assert.equal(restored.schemaVersion,4)
  assert.deepEqual(restored.scientific.riemannStates,{left:null,right:null})
  for(const key of additionalVisibility)assert.equal(restored.presentation.visibility[key],false)
 }
})

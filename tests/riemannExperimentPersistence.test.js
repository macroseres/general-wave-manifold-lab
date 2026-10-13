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

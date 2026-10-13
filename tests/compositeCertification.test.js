import test from "node:test"
import assert from "node:assert/strict"
import { certifyCompositeBranches, certifyCompositePoint, compositeLeafIntersections, decomposeCompositeBranches } from "../src/math/state/compositeTrace.js"
import { defaultCoefficients } from "../src/math/quadraticFlux.js"

test("composite certification API is pure and reports invalid malformed points",()=>{
  const result=certifyCompositePoint(null,null,{},"minus")
  assert.equal(result.valid,false)
  assert.equal(result.sonicSatisfied,false)
  assert.equal(result.fibreSatisfied,false)
})

test("branch certification preserves branch topology and attaches certificates",()=>{
  const branches=[{branchId:"K-1",points:[{P:null,Q:null},{P:null,Q:null}]}]
  const certified=certifyCompositeBranches(branches,{},"minus")
  assert.equal(certified.length,1)
  assert.equal(certified[0].branchId,"K-1")
  assert.equal(certified[0].points.length,2)
  assert.equal(certified[0].points.every(x=>x.certificate.valid===false),true)
})

test("certification uses canonical inverseProjection and sonicSide fields",()=>{
  const source={tau:0,Y:0,z:0}
  // malformed target remains invalid, but this call guards against obsolete construction.fibre/sonic keys.
  const result=certifyCompositePoint(source,{tau:0,Y:0,z:0},{a20:0,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:0},"minus")
  assert.equal(typeof result.sonicSatisfied,"boolean")
  assert.equal(typeof result.fibreSatisfied,"boolean")
})

test("certification recognizes canonical reciprocal chart tag",()=>{
 const p=defaultCoefficients, Q={kind:"regular",chart:"reciprocal",Z:-0.024833334547777995,eta:-270.4025189205911,Upsilon:-4302.897156855953,Ubar:[271.38922885326565,-54.67814766870893],z:-40.26845440655801,tau:-0.1667557474920945,Y:106.85528462088664}
 const P={kind:"regular",tau:0,Y:0,z:0,Ubar:[2422.837807281242,-108.10578997915225],Um:[2422.837807281242,-108.10578997915225],Up:[2422.837807281242,-108.10578997915225]}
 const c=certifyCompositePoint(P,Q,p,"minus"); assert.equal(Number.isFinite(c.sonicResidual),true); assert.equal(Number.isFinite(c.stateResidual),true)
})

test("composite leaf search does not accept the trivial Y=0 sonic factor",()=>{
 const p=defaultCoefficients
 const P={kind:"regular",tau:0,Y:0,z:0,Ubar:[0,0],Um:[0,0],Up:[0,0]}
 const roots=compositeLeafIntersections(P,p,"minus",{samples:96,reciprocalSamples:64})
 for(const q of roots){
   // Every returned candidate must satisfy the non-trivial sheet residual used by the search.
   assert.equal(Number.isFinite(q.residual),true)
   assert.ok(Math.abs(q.residual)<=1e-6)
 }
})

test("finite fibre candidate endpoints are certified from Ubar Y z",()=>{
 const p=defaultCoefficients
 const P={kind:"regular",Ubar:[1,2],Um:[1,2],Up:[1,2],tau:0,Y:0,z:0}
 const Q={kind:"regular",chart:"finite",Ubar:[1,2],tau:0,Y:0,z:0}
 const c=certifyCompositePoint(P,Q,p,"minus",{sonicTolerance:Infinity,stateTolerance:1e-12})
 assert.equal(Number.isFinite(c.stateResidual),true); assert.equal(c.stateResidual,0)
})
test("branch continuation follows projective direction despite large jump-coordinate changes",()=>{
 const trace=[{P:{},intersections:[{z:0,Y:0},{z:2,Y:0}]},{P:{},intersections:[{z:.05,Y:100},{z:2.05,Y:-100}]},{P:{},intersections:[{z:.1,Y:200},{z:2.1,Y:-200}]}]
 const branches=decomposeCompositeBranches(trace)
 assert.equal(branches.length,2); assert.deepEqual(branches.map(b=>b.points.length),[3,3])
})

test("branch tracking treats opposite finite infinities as one RP1 direction",()=>{
 const trace=[
  {P:{},intersections:[{z:8,tau:.01,Y:.2},{z:.1,tau:2,Y:3}]},
  {P:{},intersections:[{z:-20,tau:-.001,Y:-.05},{z:.11,tau:2.1,Y:3.1}]},
  {P:{},intersections:[{z:-8,tau:-.01,Y:-.2},{z:.12,tau:2.2,Y:3.2}]},
 ]
 const branches=decomposeCompositeBranches(trace)
 assert.equal(branches.length,2);assert.deepEqual(branches.map(b=>b.points.length),[3,3])
})

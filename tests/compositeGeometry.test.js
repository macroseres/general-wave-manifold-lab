import { sonicSurfaceTriangles } from "../src/geometry/sonic/surface.js"
import { buildCompositeSceneData } from "../src/geometry/composite/compositeSceneData.js"
import { defaultCoefficients } from "../src/math/flux/quadraticFlux.js"
import test from "node:test"
import assert from "node:assert/strict"
import { compositeDisplayPoint, compositeBranchGeometry, auditCompositeBranches } from "../src/geometry/composite/compositeGeometry.js"
test("finite coordinates use visual compactification only",()=>{
 const p=compositeDisplayPoint({tau:2,Y:3,z:1},{tauScale:2,YScale:3,zScale:4})
 assert.equal(p.x,4);assert.equal(p.y,9);assert.ok(Math.abs(p.z-2)<1e-12)
})
test("Z=0 splits finite display geometry",()=>{
 const g=compositeBranchGeometry({branchId:"K-1",points:[{Q:{tau:0,Y:1,z:1}},{Q:{reciprocal:true,eta:1,Upsilon:1,Z:0}},{Q:{tau:0,Y:1,z:-1}}]})
 assert.deepEqual(g.segments.map(s=>s.length),[1,1])
})
test("invalid certified points are not rendered",()=>{
 const g=compositeBranchGeometry({branchId:"K-1",points:[{Q:{tau:0,Y:1,z:0},certificate:{valid:false}},{Q:{tau:1,Y:1,z:0},certificate:{valid:true}}]})
 assert.equal(g.segments.length,1);assert.equal(g.segments[0][0].x,1)
})

test("composite renderer geometry contains only display coordinates and source metadata",()=>{
 const g=compositeBranchGeometry({branchId:"K",points:[{Q:{tau:1,Y:2,z:0},certificate:{valid:true}}]})
 assert.deepEqual(Object.keys(g.segments[0][0]).sort(),["mathematical","source","x","y","z"])
})

test("composite scene diagnostics expose certification statistics", async()=>{
 const {compositeSceneDiagnostics}=await import("../src/geometry/composite/compositeSceneData.js")
 const minus={sourcePoints:3,candidates:4,certifiedPoints:4,validPoints:2,branches:2,singletonBranches:1,sonic:{min:1e-10,max:2e-5},fibre:{min:2e-10,max:3e-4},example:{sonicResidual:1e-10,stateResidual:2e-10}}
 const d=compositeSceneDiagnostics({minus:{geometry:[],diagnostics:minus},plus:{geometry:[],diagnostics:{sourcePoints:0,candidates:0,certifiedPoints:0,validPoints:0,branches:0,singletonBranches:0,sonic:{min:null,max:null},fibre:{min:null,max:null},example:null}}})
 assert.deepEqual(d.minus,minus)
 assert.equal(d.plus.validPoints,0)
 assert.equal(d.plus.sonic.min,null)
})

test("geometry audit separates mathematical extent from display window",()=>{
 const branches=[{branchId:"K",points:[{Q:{tau:0,Y:0,z:0}},{Q:{tau:100,Y:200,z:.1}}]}]
 const a=auditCompositeBranches(branches,{tauMin:-5,tauMax:5,YMin:-6,YMax:6})
 assert.equal(a.insideWindow,1);assert.equal(a.outsideWindow,1);assert.equal(a.segments,1);assert.equal(a.maxDeltaTau,100);assert.equal(a.maxDeltaY,200)
})
test("display clipping does not mutate mathematical composite points",()=>{
 const branch={branchId:"K",points:[{Q:{tau:0,Y:0,z:0}},{Q:{tau:100,Y:0,z:.1}}]}
 const g=compositeBranchGeometry(branch,{}, {tauMin:-5,tauMax:5,YMin:-6,YMax:6})
 assert.equal(branch.points[1].Q.tau,100);assert.ok(g.segments.flat().every(q=>q.mathematical.tau<=5))
})

test("visual geometry splits a legitimate RP1 crossing at duplicated z-hat borders",()=>{
 const branch={branchId:"K",points:[{Q:{tau:0,Y:0,z:8}},{Q:{tau:0,Y:0,z:-20}}]}
 const g=compositeBranchGeometry(branch,{}, {tauMin:-5,tauMax:5,YMin:-6,YMax:6})
 assert.equal(g.segments.length,2)
 assert.ok(g.segments.every(s=>s.length===1))
})

test("composite topology audit classifies every branch endpoint",()=>{
 const d=buildCompositeSceneData(defaultCoefficients,-5,5,{showMinus:true,showPlus:false,YMin:-6,YMax:6}).minus.diagnostics
 const t=d.topology
 assert.equal(t.endpoints,t["rarefaction-end"]+t["outside-window"]+t["projective-boundary"]+t["root-disappearance"]+t.unclassified)
 assert.equal(t.unclassified,0)
})
test("current Wave Manifold preset has exact K-minus/K-plus mirror symmetry",()=>{
 const d=buildCompositeSceneData(defaultCoefficients,-5,5,{showMinus:true,showPlus:true,YMin:-6,YMax:6})
 assert.equal(d.minus.diagnostics.symmetry.exactMirror,true)
 assert.equal(d.minus.diagnostics.symmetry.matched,d.minus.diagnostics.symmetry.minusPoints)
 assert.equal(d.minus.diagnostics.symmetry.maxMirrorResidual,0)
})

test("structured implicit sonic mesh is indexed and free of degenerate faces",()=>{
 const mesh=sonicSurfaceTriangles(defaultCoefficients,{tauMin:-5,tauMax:5,YMin:-6,YMax:6,side:"minus",nTau:14,nY:12,nZ:18})
 assert.ok(mesh.positions.length>0);assert.ok(mesh.indices.length>0)
 assert.equal(mesh.indices.length%3,0)
 for(let k=0;k<mesh.indices.length;k+=3)assert.equal(new Set(mesh.indices.slice(k,k+3)).size,3)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import {sampledHugoniotArc,selectedCandidateHugoniotArc} from '../src/math/solution/riemannBranchHighlight.js'

test('extracts only the sampled subarc ending near U_M',()=>{
 const arc=sampledHugoniotArc([{id:'A',points:[[0,0],[1,0],[2,0],[3,0]]}],[0,0],[2,0])
 assert.deepEqual(arc.points,[[0,0],[1,0],[2,0]])
 assert.equal(arc.curveId,'A')
})
test('handles sampled curves stored in reverse order',()=>{
 const arc=sampledHugoniotArc([{points:[{u:3,v:0},{u:2,v:0},{u:1,v:0},{u:0,v:0}]}],[0,0],[2,0])
 assert.deepEqual(arc.points,[[0,0],[1,0],[2,0]])
})
test('does not invent a connection to an unresolved junction',()=>{
 assert.equal(sampledHugoniotArc([{points:[[0,0],[1,0]]}],[0,0],[3,0]),null)
})
test('uses the correct projection for each shock in a mixed chain',()=>{
 const curves={left:[{points:[[0,0],[1,0]]}],right:[{points:[[3,0],[2,0],[1,0]]}]}
 const profile={kind:'rarefaction-shock',left:[0,0],middle:[1,0],right:[3,0]}
 assert.equal(selectedCandidateHugoniotArc(profile,'plus',curves),null)
 assert.deepEqual(selectedCandidateHugoniotArc(profile,'minus',curves).points,[[3,0],[2,0],[1,0]])
})

test('provenance curve identifier prevents selecting a nearby wrong branch',()=>{
 const curves=[{id:'wrong',points:[[0,0],[1,0],[2,0]]},{id:'right',points:[[0,0],[1,0.01],[2,0.01]]}]
 const arc=sampledHugoniotArc(curves,[0,0],[2,0],{curveId:'right',tolerance:0.05})
 assert.equal(arc.curveId,'right')
 assert.equal(arc.provenanceMatched,true)
 assert.equal(sampledHugoniotArc(curves,[0,0],[2,0],{curveId:'missing'}),null)
})
test('segment index restricts the junction to the construction segment',()=>{
 const curves=[{id:'loop',points:[[0,0],[1,0],[2,0],[1,0],[0,0]]}]
 const arc=sampledHugoniotArc(curves,[0,0],[1,0],{curveId:'loop',segmentIndex:2.8})
 assert.equal(arc.segmentIndex,2.8)
 assert.deepEqual(arc.points,[[0,0],[1,0],[2,0],[1,0]])
})
test('selected candidate uses shock provenance to disambiguate branches',()=>{
 const curves={right:[{id:'A',points:[[3,0],[2,0],[1,0]]},{id:'B',points:[[3,0],[2,0.01],[1,0.01]]}]}
 const profile={kind:'rarefaction-shock',left:[0,0],middle:[1,0],right:[3,0],provenance:{waves:[{type:'shock',origin:'backward-hugoniot',segment:'B',segmentIndex:1.4}]}}
 assert.equal(selectedCandidateHugoniotArc(profile,'minus',curves,{tolerance:0.05}).curveId,'B')
})

test('interpolates endpoint inside sampled segment rather than ending at a vertex',()=>{
 const arc=sampledHugoniotArc([{id:'A',points:[[0,0],[1,0],[2,0]]}],[0,0],[1.4,0],{curveId:'A',segmentIndex:1.4})
 assert.deepEqual(arc.points,[[0,0],[1,0],[1.4,0]])
 assert.equal(arc.endpointInterpolated,true)
 assert.ok(arc.junctionResidual<1e-12)
})
test('rejects a middle state far from its provenance segment',()=>{
 assert.equal(sampledHugoniotArc([{id:'A',points:[[0,0],[1,0],[2,0]]}],[0,0],[1.5,0.2],{curveId:'A',segmentIndex:1.5,tolerance:0.05}),null)
})
test('reverses the interpolated arc when sampled Hugoniot runs backward',()=>{
 const arc=sampledHugoniotArc([{points:[[3,0],[2,0],[1,0],[0,0]]}],[0,0],[1.5,0],{segmentIndex:1.5})
 assert.deepEqual(arc.points,[[0,0],[1,0],[1.5,0]])
 assert.equal(arc.orientation,'reversed')
})

import {refineHugoniotSegmentEndpoint} from '../src/math/solution/riemannBranchHighlight.js'
const rhFlux={a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0.5,b10:0,b01:0}
test('RH refinement locates a nontrivial root inside its provenance segment',()=>{
 // fixed=(0,0), variable=(u,v): det(jump,delta F)=uv(v-u)/2.
 // On v=0.5, nontrivial root at u=0.5.
 const root=refineHugoniotSegmentEndpoint([0.3,0.5],[0.7,0.5],[0,0],[0.52,0.5],rhFlux,{tolerance:0.05})
 assert.ok(root)
 assert.ok(Math.abs(root.point[0]-0.5)<1e-9)
 assert.ok(root.relativeResidual<1e-8)
})
test('RH refinement refuses roots far from the selected middle state',()=>{
 assert.equal(refineHugoniotSegmentEndpoint([0.3,0.5],[0.7,0.5],[0,0],[0.65,0.5],rhFlux,{tolerance:0.05}),null)
})
test('highlight uses RH-corrected endpoint when flux is provided',()=>{
 const arc=sampledHugoniotArc([{id:'A',points:[[0,0],[0.3,0.5],[0.7,0.5]]}],[0,0],[0.52,0.5],{curveId:'A',segmentIndex:1,fluxCoefficients:rhFlux,tolerance:0.05})
 assert.ok(arc)
 assert.equal(arc.refinement,'rankine-hugoniot-segment')
 assert.ok(Math.abs(arc.points.at(-1)[0]-0.5)<1e-9)
 assert.ok(arc.rankineHugoniotRelativeResidual<1e-8)
})

test('polynomial solver detects a root when the whole segment lies on Hugoniot',()=>{
 const root=refineHugoniotSegmentEndpoint([0.3,0.3],[0.7,0.7],[0,0],[0.51,0.51],rhFlux,{tolerance:0.02})
 assert.ok(root)
 assert.ok(Math.abs(root.point[0]-0.51)<1e-10)
 assert.ok(root.relativeResidual<1e-8)
})
test('polynomial solver rejects the trivial fixed-state root',()=>{
 const root=refineHugoniotSegmentEndpoint([-0.2,0],[0.2,0],[0,0],[0,0],rhFlux,{tolerance:0.01})
 assert.equal(root,null)
})

test('resolves two nearby nontrivial RH roots without merging them',()=>{
  // det = u*v*(v-u)/2: roots u=0 and u=v at fixed v=0.001.
  const a=[-0.0005,0.001],b=[0.0015,0.001]
  const zero=refineHugoniotSegmentEndpoint(a,b,[0,0],[0,0.001],rhFlux,{tolerance:0.0002})
  const diagonal=refineHugoniotSegmentEndpoint(a,b,[0,0],[0.001,0.001],rhFlux,{tolerance:0.0002})
  assert.ok(zero)
  assert.ok(diagonal)
  assert.ok(Math.abs(zero.point[0])<1e-9)
  assert.ok(Math.abs(diagonal.point[0]-0.001)<1e-9)
})
test('does not promote an almost tangent but rootless segment to RH',()=>{
  // det=u²/2 for F=(u²/2,uv), fixed=(0,0), v=1;
  // along u=0.0001 + 0.00001*t, no root exists on the segment.
  const fluxTangency={...rhFlux,b11:1,b02:0}
  assert.equal(refineHugoniotSegmentEndpoint([0.0001,1],[0.00011,1],[0,0],[0.000105,1],fluxTangency,{tolerance:0.01}),null)
})
test('reports conditioning diagnostics without declaring entropy admissibility',()=>{
 const root=refineHugoniotSegmentEndpoint([0.3,0.5],[0.7,0.5],[0,0],[0.5,0.5],rhFlux,{tolerance:0.01})
 assert.ok(root)
 assert.equal(root.rootCondition,'transverse-numerical')
 assert.ok(root.normalizedDeterminantSlope>0)
 assert.equal('entropyCertified' in root,false)
})
test('reports whole-segment degeneracy explicitly',()=>{
 const root=refineHugoniotSegmentEndpoint([0.3,0.3],[0.7,0.7],[0,0],[0.5,0.5],rhFlux,{tolerance:0.01})
 assert.equal(root.rootCondition,'segment-contained')
})

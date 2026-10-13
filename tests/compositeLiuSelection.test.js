import test from 'node:test'
import assert from 'node:assert/strict'
import {classifyCompositeLiu} from '../src/math/solution/compositeLiuSelection.js'
const contact={family:'slow',sonicSide:'plus',refinement:{status:'converged',point:[1,2]}}
const candidate={kind:'shock-rarefaction',contactSide:'left',family:'slow',point:[1,2],status:'weak-lax-candidate'}
test('forward Liu violation rejects candidate at numerical level',()=>{
 const [q]=classifyCompositeLiu([candidate],{left:[contact]},[{assessment:{status:'liu-violation-detected'}}])
 assert.equal(q.liuStatus,'violation-detected')
})
test('no violation found does not claim admissibility',()=>{
 const [q]=classifyCompositeLiu([candidate],{left:[contact]},[{assessment:{status:'no-liu-violation-detected',passes:false}}])
 assert.equal(q.liuStatus,'no-violation-detected');assert.equal(q.liuAssessment.passes,false)
})
test('backward shock without matching backward contact is inconclusive',()=>{
 const [q]=classifyCompositeLiu([{...candidate,kind:'rarefaction-shock',contactSide:'right'}],{left:[contact]},[])
 assert.equal(q.liuStatus,'inconclusive')
})
test('unmatched contact is inconclusive',()=>{
 const [q]=classifyCompositeLiu([{...candidate,point:[4,5]}],{left:[contact]},[])
 assert.equal(q.liuStatus,'inconclusive')
})
test('ambiguous contact is inconclusive',()=>{
 const [q]=classifyCompositeLiu([candidate],{left:[contact,contact]},[])
 assert.equal(q.liuReason,'ambiguous-contact')
})
test('weak Lax prerequisite is respected',()=>{
 const [q]=classifyCompositeLiu([{...candidate,status:'shock-endpoint-rejected'}],{left:[contact]},[])
 assert.equal(q.liuStatus,'not-evaluated')
})
const backwardContact={family:'fast',sonicSide:'minus',refinement:{status:'converged',point:[3,4]}}
const backwardCandidate={kind:'rarefaction-shock',contactSide:'right',family:'fast',point:[3,4],status:'weak-lax-candidate'}
test('backward Liu violation is associated with rarefaction–shock',()=>{
 const [q]=classifyCompositeLiu([backwardCandidate],{right:[backwardContact]},[],[{status:'preliminary-sampled-backward-liu-violation'}])
 assert.equal(q.liuStatus,'violation-detected')
})
test('backward no-violation remains preliminary',()=>{
 const [q]=classifyCompositeLiu([backwardCandidate],{right:[backwardContact]},[],[{status:'preliminary-sampled-backward-liu-compatible',passes:false}])
 assert.equal(q.liuStatus,'no-violation-detected');assert.equal(q.liuAssessment.passes,false)
})
test('backward missing arc is inconclusive',()=>{
 const [q]=classifyCompositeLiu([backwardCandidate],{right:[backwardContact]},[],[{status:'unresolved'}])
 assert.equal(q.liuStatus,'inconclusive')
})
test('backward contact family and sonic side must match',()=>{
 const [q]=classifyCompositeLiu([backwardCandidate],{right:[{...backwardContact,sonicSide:'plus'}]},[],[])
 assert.equal(q.liuReason,'contact-not-found')
})
test('backward duplicate contacts remain ambiguous',()=>{
 const [q]=classifyCompositeLiu([backwardCandidate],{right:[backwardContact,backwardContact]},[],[])
 assert.equal(q.liuReason,'ambiguous-contact')
})
test('backward Liu is not evaluated without weak Lax prerequisite',()=>{
 const [q]=classifyCompositeLiu([{...backwardCandidate,status:'ordered-geometric-candidate'}],{right:[backwardContact]},[],[])
 assert.equal(q.liuStatus,'not-evaluated')
})

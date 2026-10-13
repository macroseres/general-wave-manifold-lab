import test from 'node:test'
import assert from 'node:assert/strict'
import {groupRiemannCandidates} from '../src/math/solution/riemannCandidateGroups.js'
const two=(m=1,s=[1,3],e={})=>({status:'sampled-candidate',kind:'two-shock',states:[[0,0],[m,0],[2,0]],speeds:s,evidence:e})
const mixed=(fan,kind='rarefaction-shock')=>({status:'sampled-candidate',kind,left:[0,0],middle:[1,0],right:[2,0],shockSpeed:3,fanStates:fan,fanSpeeds:[0,1,2],evidence:{status:'necessary-tests-passed'}})
test('near-identical two-shock candidates are grouped without removal',()=>{const g=groupRiemannCandidates([two(),two(1+1e-7)]);assert.equal(g.length,2);assert.equal(g[0].groupId,g[1].groupId);assert.equal(g[0].groupSize,2)})
test('distinct intermediate states remain distinct',()=>assert.notEqual(...groupRiemannCandidates([two(),two(1.1)]).map(g=>g.groupId)))
test('distinct speeds and evidence remain distinct',()=>{const g=groupRiemannCandidates([two(),two(1,[1,4]),two(1,[1,3],{status:'liu-violation-detected'})]);assert.equal(new Set(g.map(x=>x.groupId)).size,3)})
test('different wave types are never grouped',()=>assert.notEqual(...groupRiemannCandidates([two(),mixed([[0,0],[.5,0],[1,0]])]).map(g=>g.groupId)))
test('distinct rarefaction paths remain separate even with the same middle state',()=>{const a=mixed([[0,0],[.5,0],[1,0]]),b=mixed([[0,0],[.5,.4],[1,0]]);assert.notEqual(...groupRiemannCandidates([a,b]).map(g=>g.groupId))})
test('unverified candidates are not merged by missing fields',()=>{const g=groupRiemannCandidates([{status:'bad'},{status:'bad'}]);assert.notEqual(g[0].groupId,g[1].groupId)})

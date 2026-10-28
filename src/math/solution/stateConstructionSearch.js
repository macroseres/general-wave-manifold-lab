import {searchTwoShockCandidates} from './twoShockCandidates.js'
import {assessTwoShockCandidates} from './riemannWaveChains.js'
import {searchMixedWaveCandidates} from './mixedWaveChains.js'
import {assessMixedChainsWithLiu} from './mixedChainLiu.js'
import {twoShockSelfSimilarCandidate,mixedSelfSimilarCandidate} from './riemannSelfSimilarCandidate.js'
import {physicalChainEvidence} from './physicalChainEvidence.js'
import {candidateProvenance} from './riemannCandidateProvenance.js'
import {searchRarefactionPairs} from './rarefactionPairCandidates.js'
import {contactChainCandidates} from './contactChainCandidates.js'
import {compositeBlockChainCandidates} from './compositeBlockChainCandidates.js'
import {stateShockBranches} from './stateShockBranches.js'

const valid=U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)
const pending=()=>({candidates:[],report:{status:'not-requested',complete:false}})

/** UI orchestration only: reuse the existing bounded constructors and evidence.
 * Keep failures local to each search; never upgrade numerical tests to entropy.
 */
export function stateConstructionSearch(states,branches,hugoniot,p,requested,revision=0){
  const reports=[]
  let stateBranches=null
  if(requested&&valid(states?.left)&&valid(states?.right)){
    try{
      stateBranches=stateShockBranches(states,p)
      hugoniot={left:[...(hugoniot?.left??[]),...stateBranches.curves.left],right:[...(hugoniot?.right??[]),...stateBranches.curves.right]}
    }catch(error){reports.push({patterns:'Continuação RH',status:'numerical-failure',count:0,reason:error.message})}
  }
  const run=(patterns,fn)=>{
    let result=pending()
    if(requested){
      if(!valid(states?.left)||!valid(states?.right))result={candidates:[],report:{status:'invalid-input',complete:false}}
      else try{result=fn()}catch(error){result={candidates:[],report:{status:'numerical-failure',complete:false,reason:error.message}}}
    }
    reports.push({patterns,...result.report,count:result.candidates.length})
    return result
  }
  const ss=run('SS',()=>searchTwoShockCandidates(states.left,states.right,hugoniot.left,hugoniot.right,p))
  const shockCandidates=assessTwoShockCandidates(states?.left,states?.right,ss.candidates,p)
  const mixed=run('RS, SR',()=>searchMixedWaveCandidates(states,branches,hugoniot,p))
  const mixedCandidates=mixed.candidates
  const mixedLiuCandidates=assessMixedChainsWithLiu(mixedCandidates,states,p)
  const profileCandidates={twoShock:[],mixed:[]}
  // Profile reconstruction is part of its group's search, including numerical failures.
  for(const [key,sources] of [['twoShock',shockCandidates],['mixed',mixedLiuCandidates]]){
    const report=reports.find(r=>r.patterns===(key==='twoShock'?'SS':'RS, SR'))
    for(const source of sources){
      if(key==='twoShock'&&!(source.refinement?.status==='refined-candidate'&&source.familyEvidence.status==='ordered-lax-endpoint-candidate'))continue
      try{
        const profile=key==='twoShock'?twoShockSelfSimilarCandidate(states.left,source.middle,states.right,p):mixedSelfSimilarCandidate(states.left,states.right,source,branches,p)
        if(profile.status==='sampled-candidate')profileCandidates[key].push({...profile,
          pattern:profile.kind==='two-shock'?'SS':profile.kind==='rarefaction-shock'?'RS':'SR',
          evidence:physicalChainEvidence(profile,source),provenance:candidateProvenance(profile,source)})
        else (report.profileRejections??=[]).push(profile.status)
      }catch(error){(report.profileRejections??=[]).push(error.message)}
    }
    report.selectable=profileCandidates[key].length
  }
  const rarefactionSearch=run('RR',()=>searchRarefactionPairs(states,branches,p))
  const arraySearch=fn=>{
    const candidates=fn()
    return {candidates,report:{status:candidates.length?'candidates-found':'no-candidates-found',complete:false,
      qualification:'Busca limitada; o construtor não fornece motivos por tentativa. Nenhum resultado não prova inexistência.'}}
  }
  const contactChains=run('RC, SC, CR, CS, CC',()=>arraySearch(()=>contactChainCandidates(states,branches,hugoniot,p))).candidates
  const compositeChains=run('RK, SK, CK, KR, KS, KC, KK',()=>arraySearch(()=>compositeBlockChainCandidates(states,branches,hugoniot,p))).candidates
  const allProfiles=[...profileCandidates.twoShock,...profileCandidates.mixed,...rarefactionSearch.candidates,...contactChains,...compositeChains]
  return {shockCandidates,mixedCandidates,mixedLiuCandidates,profileCandidates,rarefactionSearch,
    rarefactionPairs:rarefactionSearch.candidates,contactChains,compositeChains,allProfiles,reports,stateBranches,revision}
}

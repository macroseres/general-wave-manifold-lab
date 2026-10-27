/** Sampled construction provenance; metadata is not a proof of admissibility. */
export function candidateProvenance(profile, source){
  if(profile?.status!=='sampled-candidate'||!source)return null
  if(profile.kind==='two-shock')return {
    kind:profile.kind,
    waves:[{type:'shock',family:'slow',from:'U_L',to:'U_M',speed:profile.speeds[0],origin:'forward-hugoniot',segment:source.forwardSegment??null},
      {type:'shock',family:'fast',from:'U_M',to:'U_R',speed:profile.speeds[1],origin:'backward-hugoniot',segment:source.backwardSegment??null}],
    intersection:source.refinement?.status==='refined-candidate'?'corrected-rh-junction':'sampled-hugoniot-intersection',
    refinementStatus:source.refinement?.status??'not-evaluated',entropyCertified:false
  }
  if(!['rarefaction-shock','shock-rarefaction'].includes(profile.kind))return null
  const rarefaction={type:'rarefaction',family:source.family,from:profile.kind==='rarefaction-shock'?'U_L':'U_M',to:profile.kind==='rarefaction-shock'?'U_M':'U_R',origin:'sampled-characteristic-branch',branchSign:source.branchSign??null,branchIndex:source.branchIndex??null,speedStart:profile.fanSpeeds?.[0],speedEnd:profile.fanSpeeds?.at(-1)}
  const shock={type:'shock',family:source.family==='slow'?'fast':'slow',from:profile.kind==='rarefaction-shock'?'U_M':'U_L',to:profile.kind==='rarefaction-shock'?'U_R':'U_M',speed:profile.shockSpeed,origin:profile.kind==='rarefaction-shock'?'backward-hugoniot':'forward-hugoniot',segment:source.curveId??null,segmentIndex:source.hugoniotIndex??null}
  return {kind:profile.kind,waves:profile.kind==='rarefaction-shock'?[rarefaction,shock]:[shock,rarefaction],intersection:'refined-fan-hugoniot-junction',refinementStatus:source.refinement?.status??'unknown',entropyCertified:false}
}

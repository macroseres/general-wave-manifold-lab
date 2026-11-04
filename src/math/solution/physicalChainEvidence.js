/** Read-only provenance for a displayed self-similar candidate.
 * No finite collection of endpoint or sampled tests certifies entropy.
 */
export function physicalChainEvidence(profile, source) {
  if (profile?.status !== 'sampled-candidate') return {status:'not-displayable',entropyCertified:false}
  const twoShock=profile.kind==='two-shock'
  const geometry=twoShock?source?.chainEvidence?.status:source?.evidence?.status
  const lax=twoShock?source?.familyEvidence?.status:source?.evidence?.status
  const fan=twoShock?'not-applicable':source?.fanArc?.status
  const liu=twoShock?'per-wave':source?.liu?.status??'not-evaluated'
  const liuByWave=twoShock?(source?.liuByWave??[]).map(q=>({status:q?.status??'inconclusive',
    orientation:q?.direction??null,checked:q?.checked??0,reason:q?.reason??null,certified:false})):null
  const liuViolation=liu==='liu-violation-detected'||liuByWave?.some(q=>q.status==='liu-violation-detected')===true
  const geometricPass=twoShock?geometry==='ordered-rh-candidate':geometry==='mixed-ordered-lax-candidate'
  const laxPass=twoShock?lax==='ordered-lax-endpoint-candidate':lax==='mixed-ordered-lax-candidate'
  const fanPass=twoShock?true:source?.fanArc?.passes===true
  return {
    status:liuViolation?'liu-violation-detected':geometricPass&&laxPass&&fanPass?'necessary-tests-passed':'prerequisites-unverified',
    geometry, lax, fan, liu, ...(twoShock?{liuByWave}:{}),
    checks:{geometry:geometricPass,lax:laxPass,fan:fanPass,liuViolation},
    entropyCertified:false,
  }
}

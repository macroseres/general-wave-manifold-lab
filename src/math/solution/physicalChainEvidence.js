/** Read-only provenance for a displayed self-similar candidate.
 * No finite collection of endpoint or sampled tests certifies entropy.
 */
export function physicalChainEvidence(profile, source) {
  if (profile?.status !== 'sampled-candidate') return {status:'not-displayable',entropyCertified:false}
  const twoShock=profile.kind==='two-shock'
  const geometry=twoShock?source?.chainEvidence?.status:source?.evidence?.status
  const lax=twoShock?source?.familyEvidence?.status:source?.evidence?.status
  const fan=twoShock?'not-applicable':source?.fanArc?.status
  const liu=twoShock?'not-evaluated':source?.liu?.status??'not-evaluated'
  const liuViolation=liu==='liu-violation-detected'
  const geometricPass=twoShock?geometry==='ordered-rh-candidate':geometry==='mixed-ordered-lax-candidate'
  const laxPass=twoShock?lax==='ordered-lax-endpoint-candidate':lax==='mixed-ordered-lax-candidate'
  const fanPass=twoShock?true:source?.fanArc?.passes===true
  return {
    status:liuViolation?'liu-violation-detected':geometricPass&&laxPass&&fanPass?'necessary-tests-passed':'prerequisites-unverified',
    geometry, lax, fan, liu,
    checks:{geometry:geometricPass,lax:laxPass,fan:fanPass,liuViolation},
    entropyCertified:false,
  }
}

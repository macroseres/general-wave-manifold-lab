/** Consolidate independent necessary Liu tests without converting a finite mesh
 * or refined stationary candidates into a continuous admissibility proof.
 * A detected violation has priority over inconclusive or compatible samples.
 */
export function assessForwardLiuArc(sampled, interior) {
  const reports = [
    {source:'sampled-arc',status:sampled?.status,violations:sampled?.violations?.length??0},
    {source:'refined-interior',status:interior?.status,violations:interior?.violations?.length??0},
    {source:'stationary-speed',status:interior?.stationaryOrdering?.status,
      violations:interior?.stationaryOrdering?.violations?.length??0},
  ]
  const detected=reports.filter(q=>q.violations>0||[
    'sampled-liu-violation','refined-liu-violation','stationary-liu-violation',
  ].includes(q.status))
  if(detected.length)return {status:'liu-violation-detected',passes:false,
    violationSources:detected.map(q=>q.source),reports,
    qualification:'numerical violation on the supplied oriented Hugoniot arc'}
  const complete=sampled?.status==='sampled-liu-compatible'&&
    interior?.status==='refined-liu-compatible'&&
    interior?.stationaryOrdering?.status==='stationary-no-violation-detected'&&
    interior?.tangentialRefinement?.unresolved===0
  return {status:complete?'no-liu-violation-detected':'liu-inconclusive',
    passes:false,violationSources:[],reports,
    qualification:'finite numerical tests only; no continuous Liu or entropy certificate'}
}

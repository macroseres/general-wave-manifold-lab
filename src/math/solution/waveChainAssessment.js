/**
 * Presentation-only triage of C01 necessary checks.
 * Never removes a candidate or infers entropy certification.
 */
export function assessWaveChain(classification){
  if(!classification)return {status:'inconclusive',reasons:['Diagnóstico indisponível']}
  const reasons=[]
  const junctions=classification.chainGeometry?.junctions??[]
  for(const j of junctions){
    if(j.continuity?.status==='discontinuous')reasons.push(`Junção ${j.index+1}: estados descontínuos`)
    if(j.speedOrdering?.status==='reversed')reasons.push(`Junção ${j.index+1}: velocidades fora de ordem`)
  }
  for(const w of classification.waves??[]){
    if(w.admissibility?.liu?.status==='sampled-violation-detected')
      reasons.push(`Onda ${w.index+1}: violação amostrada de Liu`)
  }
  if(reasons.length)return {status:'incompatible',reasons}
  const unknown=classification.construction?.status!=='numerical-candidate'||
    classification.weakSolution?.status==='unverified'||
    junctions.some(j=>j.continuity?.status==='unverified'||j.speedOrdering?.status==='unverified')||
    (classification.waves??[]).some(w=>
      (w.type==='shock'||w.type==='contact')&&w.conservation?.status!=='numerically-compatible'||
      w.type==='rarefaction'&&w.fan?.status!=='sampled-speed-ordered')
  if(unknown)return {status:'inconclusive',reasons:['Uma ou mais verificações necessárias não foram concluídas']}
  return {status:'numerically-compatible',reasons:['Verificações necessárias disponíveis compatíveis; entropia não certificada']}
}

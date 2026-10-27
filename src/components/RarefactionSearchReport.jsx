const labels={
  'invalid-input':'Dados ou parâmetros inválidos',
  'incompatible-branches':'Sem par de ramos elegível para RR',
  'no-candidates-found':'Nenhum candidato encontrado na busca limitada',
  'numerical-failure':'Busca com falha numérica',
  inconclusive:'Busca inconclusiva',
  'candidates-found':'Candidatos numéricos encontrados',
  'sampled-fan-rejected':'Leques da semente incompatíveis nas amostras',
  'corrected-fan-rejected':'Leques corrigidos incompatíveis nas amostras',
  'unordered-fans':'Velocidades dos leques fora de ordem',
  'ill-conditioned':'Interseção mal condicionada',
  'integration-failed':'Falha na reintegração das curvas',
  'iteration-limit':'Limite de iterações atingido',
  'line-search-failed':'Não foi possível reduzir o resíduo dentro dos ramos',
  stagnation:'Correção estagnada antes da tolerância exigida',
  'invalid-branch':'Dados de ramo inválidos',
  'invalid-seed':'Parâmetros da semente inválidos',
}

export default function RarefactionSearchReport({report}){
  const rejected=report.diagnostics.filter(d=>!['numerically-compatible','duplicate'].includes(d.classification))
  const pending=report.pairs.filter(q=>q.status!=='examined').length
  return <div className="stateProjectionControls" role="status"><div><b>Diagnóstico da busca RR</b>
    <small>{labels[report.status]}. Candidatos: {report.candidateCount}; pares de ramos com exame pendente: {pending}.</small>
    {report.candidateLimitReached&&<small>Limite de candidatos atingido. {report.seedSearchExhausted?'Todas as sementes dos pares fornecidos foram examinadas.':'Há sementes ou pares de ramos não examinados.'}</small>}
    <small>Falhas e casos inconclusivos: {rejected.filter(d=>['numerical-failure','inconclusive','invalid-input'].includes(d.classification)).length}. Ausência de candidatos não demonstra inexistência de solução.</small>
    {rejected.length>0&&<details><summary>Motivos por tentativa ({rejected.length})</summary>{rejected.map((d,i)=><small key={i}>Par {d.pairIndex+1}: {labels[d.status]??'Tentativa não concluída'}{Number.isFinite(d.refinement?.residual)?` · resíduo ${d.refinement.residual.toExponential(3)}`:''}.</small>)}</details>}
    {report.branches.some(b=>b.relevant&&b.stop==='integration-tolerance')&&<small>Há ramos interrompidos porque a integração não satisfez a tolerância.</small>}
  </div></div>
}

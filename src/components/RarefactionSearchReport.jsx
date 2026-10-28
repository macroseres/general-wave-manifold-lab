const labels={
  'not-requested':'Aguardando solicitação de construção',
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
  'branch-trace-mismatch':'Ramo fornecido incompatível com a reintegração na tolerância adotada',
  'branch-integration-failed':'Não foi possível verificar o traçado do ramo fornecido',
  'join-tolerance-exceeded':'Deslocamento da junção acima da tolerância de estado',
}

export default function RarefactionSearchReport({report}){
  const rejected=(report.diagnostics??[]).filter(d=>!['numerically-compatible','duplicate','seed-warning'].includes(d.classification))
  const warnings=(report.diagnostics??[]).filter(d=>d.classification==='seed-warning').length
  const pending=(report.pairs??[]).filter(q=>q.status!=='examined').length
  return <div className="stateProjectionControls" role="status"><div><b>Diagnóstico da busca RR</b>
    <small>{labels[report.status]??'Busca não concluída'}. Candidatos: {report.candidateCount??0}; pares de ramos com exame pendente: {pending}.</small>
    {report.candidateLimitReached&&<small>Limite de candidatos atingido. {report.seedSearchExhausted?'Todas as sementes dos pares fornecidos foram examinadas.':'Há sementes ou pares de ramos não examinados.'}</small>}
    <small>Falhas e casos inconclusivos: {rejected.filter(d=>['numerical-failure','inconclusive','invalid-input'].includes(d.classification)).length}. Ausência de candidatos não demonstra inexistência de solução.</small>
    {warnings>0&&<small>Sementes com ressalvas poligonais: {warnings}. A decisão usa a correção e os leques reintegrados.</small>}
    {rejected.length>0&&<details><summary>Motivos por tentativa ({rejected.length})</summary>{rejected.map((d,i)=><small key={i}>Par {d.pairIndex+1}: {labels[d.status]??'Tentativa não concluída'}{Number.isFinite(d.refinement?.residual)?` · resíduo ${d.refinement.residual.toExponential(3)}`:''}.</small>)}</details>}
    {(report.branches??[]).some(b=>b.relevant&&b.stop==='integration-tolerance')&&<small>Há ramos interrompidos porque a integração não satisfez a tolerância.</small>}
  </div></div>
}

import {candidateSegments} from '../geometry/state/candidateStateGeometry.js'

const number=x=>Number.isFinite(x)?Number(x.toPrecision(6)).toString():'—'
const state=U=>U?`(${U.map(number).join(', ')})`:'—'
const names={shock:'Choque',contact:'Contato',rarefaction:'Rarefação'}
const statuses={'not-requested':'Aguardando construção','invalid-input':'Defina os dois estados',
  'candidates-found':'Candidatos encontrados','no-candidates-found':'Nenhum candidato encontrado na busca limitada',
  'numerical-failure':'Falha numérica',inconclusive:'Busca inconclusiva','incompatible-branches':'Sem ramos elegíveis neste domínio'}
const reasons={
  'sampled-candidate':'Perfil candidato reconstruído',
  'no-constant-contact-model':'Nenhum modelo de contato com direção e velocidade constantes nos coeficientes',
  'contact-family-mismatch':'Modelo de contato incompatível com a família no estado de referência',
  'parallel-contact-lines':'Direções de contato paralelas; interseção isolada não obtida',
  'contact-connection-unverified':'Conexão de contato não verificada (amplitude, direção, família ou RH)',
  'no-isolated-affine-root':'Equação RH na reta de contato sem raiz isolada',
  'unanchored-curve':'Curva não ancorada no estado de referência',
  'no-sampled-intersection':'Nenhuma interseção nos segmentos amostrados',
  'fan-prefix-unverified':'Prefixo do leque não passou nas verificações de velocidade e tangente',
  'no-sampled-composite-curve':'Nenhuma curva composta com pelo menos duas amostras obtida',
  'intersection-refinement-failed':'Refinamento local da interseção não concluído',
  'sonic-endpoint-unverified':'Extremo do salto sônico não coincide com a conexão',
  'sonic-shock-unverified':'RH, condição sônica ou Lax não estrito não verificados no salto interno',
  'duplicate-middle':'Conexão duplicada já registrada',
  'family-lax-unverified':'Famílias lenta → rápida ou Lax de extremos não verificados',
  'family-order-unverified':'Ordenação das famílias não verificada',
  'speed-ordering-unverified':'Ordenação das velocidades não verificada',
  'strict-lax-failed':'Lax estrito de extremos não satisfeito',
  'strict-lax-endpoint-candidate':'Lax estrito de extremos compatível numericamente',
  'rankine-hugoniot-unverified':'Rankine–Hugoniot não verificado',
  'ordered-rh-candidate':'RH e ordenação de velocidades compatíveis numericamente',
  'line-search-failed':'O corretor não conseguiu reduzir o resíduo',
  'off-sampled-arc':'A raiz corrigida ficou fora do arco amostrado',
  unbracketed:'A busca não delimitou a raiz no intervalo',
  'unrefined-middle':'Estado intermediário sem refinamento concluído',
  'unverified-chain':'A cadeia não passou nos requisitos para reconstruir o perfil',
  'refined-candidate':'Refinamento concluído numericamente',
  'sampled-fan-ordered':'Velocidades do leque ordenadas nas amostras',
}
const reason=value=>reasons[value]??statuses[value]??value
const reportSummary=report=>report.status==='candidates-found'&&report.selectable===0&&report.count>0?
  'Candidatos geométricos sem perfil selecionável':statuses[report.status]??report.status

export function StateConstructionReports({reports,stateBranches}){
  return <div className="stateConstructionReports" aria-label="Resultados das buscas de cadeias">
    {reports.map(report=><details key={report.patterns}><summary>{report.patterns}: {reportSummary(report)} · {report.selectable??report.count} selecionável(is)</summary>
      <small>Busca limitada; ausência de candidatos não demonstra inexistência.</small>
      {report.selectable!==undefined&&<p>Candidatos geométricos: {report.count}; perfis selecionáveis: {report.selectable}. A lista Cadeia contém apenas os perfis selecionáveis.</p>}
      {report.reason&&<p>{report.reason}</p>}{report.qualification&&<p>{report.qualification}</p>}
      {report.limitReached&&<p>Limite de candidatos atingido; há partes não examinadas.</p>}
      {report.branchLimitReached&&<p>Limite de ramos sônicos atingido; outros ramos podem não ter sido acompanhados.</p>}
      {report.attemptCount!==undefined&&<>
        <p>{report.attemptCount} tentativa(s) registrada(s). Detalhes: {report.attempts.length} de {report.attemptCount}.</p>
        <ul>{Object.entries(report.reasonCounts).map(([status,count])=><li key={status}>{reason(status)}: {count}</li>)}</ul>
        {report.detailsTruncated&&<p>Lista de detalhes limitada a {report.detailsLimit}; as contagens incluem todas as tentativas registradas.</p>}
        <details><summary>Tentativas de contatos e compostas</summary>{report.attempts.map((attempt,i)=><p key={i}>{i+1}. {attempt.pattern}: {reason(attempt.status)}{attempt.middle?` · U_M = ${state(attempt.middle)}`:''}{Number.isFinite(attempt.speedGap)?` · diferença de velocidades = ${number(attempt.speedGap)}`:''}</p>)}</details>
      </>}
      {report.sampledIntersections!==undefined&&<p>Interseções amostradas: {report.sampledIntersections}; refinadas: {report.refined??0}.</p>}
      {(report.rejected??[]).map((r,i)=><small key={i}>Tentativa {i+1}: {reason(r.status??r.reason??'inconclusive')}</small>)}
      {(report.profileAssessments??[]).filter(a=>a.profileStatus!=='sampled-candidate').map(a=><details key={`assessment-${a.index}`}><summary>Candidato geométrico {a.index+1}: {reason(a.profileStatus)}</summary>
        <p>U_M: {state(a.middle)}</p>
        {a.refinement&&<p>Correção: {reason(a.refinement)}.</p>}
        {a.chain&&<p>Conservação e velocidades: {reason(a.chain)}.</p>}
        {a.family&&<p>Famílias: {reason(a.family)}.</p>}
        {a.firstShock&&<p>Primeiro salto: {reason(a.firstShock)}.</p>}
        {a.secondShock&&<p>Segundo salto: {reason(a.secondShock)}.</p>}
        {Number.isFinite(a.speedGap)&&<p>Diferença s₂ − s₁: {number(a.speedGap)}.</p>}
        {a.fan&&<p>Leque: {reason(a.fan)}.</p>}
      </details>)}
      {(report.profileRejections??[]).map((value,i)=><small key={`profile-${i}`}>Perfil não selecionável: {reason(value)}</small>)}
    </details>)}
    {stateBranches&&<details><summary>Domínio e paradas dos ramos de choque</summary>
      <small>Continuação característica nos estados: até {stateBranches.limits.maxSteps} passos por ramo, passo {stateBranches.limits.step} vezes a escala dos estados, raio máximo {stateBranches.limits.maxRadius} vezes a mesma escala. Curvas projetadas disponíveis também fornecem sementes. Busca sem completude global.</small>
      {stateBranches.stops.map((s,i)=><p key={i}>{s.side==='left'?'U_L':'U_R'} · família {s.family==='slow'?1:2} · sentido {s.sign??'—'}: {s.reason}</p>)}
    </details>}
    <small>Contatos: direção e velocidade constantes. K lenta: R–S; K rápida: S–R. CK, KC e KK ainda sem exemplos positivos quadráticos validados.</small>
  </div>
}

export default function StateChainInspection({candidate,geometry,label='Ondas da cadeia selecionada'}){
  const segments=geometry?.segments??candidateSegments(candidate)
  return <section className="stateChainInspection" aria-label={label}>
    <strong>{label}</strong>
    <p>{candidate.pattern??candidate.kind} · {candidate.evidence?.liu==='liu-violation-detected'?'violação amostrada de Liu detectada':'compatível com os testes necessários do construtor'} · admissibilidade entrópica inconclusiva</p>
    {geometry&&!geometry.complete&&<p role="status">Construção gráfica parcial: há arco de choque inconclusivo. Os extremos estão assinalados; nenhum segmento reto substitui o arco.</p>}
    {segments.map((s,i)=><details key={i} open><summary>{i+1}. {names[s.type]} · família {s.family==='slow'?'1 (lenta)':s.family==='fast'?'2 (rápida)':'não informada'}</summary>
      <p>{state(s.from)} → {state(s.to)}</p>
      <p>{s.type==='rarefaction'?`Velocidades do leque: ${number(s.speeds?.[0])} → ${number(s.speeds?.at(-1))}`:`Velocidade: ${number(s.speed)}`}</p>
      {s.rh&&<p>RH: {s.rh.rankineHugoniot?'compatível numericamente':'inconclusivo'} · resíduo relativo {number(s.rh.relativeResidual)}</p>}
      {s.type==='rarefaction'&&<small>Leque interpolado sobre a curva integral amostrada; verificações numéricas de crescimento e hiperbolicidade.</small>}
      {s.type==='contact'&&<small>Contato verificado no modelo de direção e velocidade constantes.</small>}
      {s.arc&&<small>Arco de choque: {s.arc.points.length>1?'continuação RH conectada numericamente':'inconclusivo; apenas extremos assinalados'}.</small>}
      {s.sonicSide&&<small>Salto interno de K · junção sônica {s.sonicSide} · Lax não estrito.</small>}
    </details>)}
    {geometry?.junctions.map((U,i)=><p key={i}>Junção sônica {i+1}: {state(U)}</p>)}
    <details><summary>Critérios e limitações do candidato</summary>
      {Object.entries(candidate.evidence??{}).filter(([,v])=>typeof v==='string').map(([key,value])=><p key={key}>{key}: {value}</p>)}
      <small>Os estados dos critérios acima são os retornados pelos construtores. Conservação, Lax de extremos e ausência de violação amostrada de Liu não certificam entropia. Critérios ausentes permanecem não avaliados.</small>
    </details>
  </section>
}

import {candidateSegments} from '../geometry/state/candidateStateGeometry.js'

const number=x=>Number.isFinite(x)?Number(x.toPrecision(6)).toString():'—'
const state=U=>U?`(${U.map(number).join(', ')})`:'—'
const names={shock:'Choque',contact:'Contato',rarefaction:'Rarefação'}
const statuses={'not-requested':'Aguardando construção','invalid-input':'Defina os dois estados',
  'candidates-found':'Candidatos encontrados','no-candidates-found':'Nenhum candidato encontrado na busca limitada',
  'numerical-failure':'Falha numérica',inconclusive:'Busca inconclusiva','incompatible-branches':'Sem ramos elegíveis neste domínio'}

export function StateConstructionReports({reports,stateBranches}){
  return <div className="stateConstructionReports" aria-label="Resultados das buscas de cadeias">
    {reports.map(report=><details key={report.patterns}><summary>{report.patterns}: {statuses[report.status]??report.status} · {report.selectable??report.count}</summary>
      <small>Busca limitada; ausência de candidatos não demonstra inexistência.</small>
      {report.reason&&<p>{report.reason}</p>}{report.qualification&&<p>{report.qualification}</p>}
      {report.limitReached&&<p>Limite de candidatos atingido; há partes não examinadas.</p>}
      {report.sampledIntersections!==undefined&&<p>Interseções amostradas: {report.sampledIntersections}; refinadas: {report.refined??0}.</p>}
      {(report.rejected??[]).map((r,i)=><small key={i}>Tentativa {i+1}: {r.status??r.reason??'inconclusiva'}</small>)}
      {(report.profileRejections??[]).map((reason,i)=><small key={`profile-${i}`}>Perfil não selecionável: {reason}</small>)}
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

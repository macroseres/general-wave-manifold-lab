import {MathLabel} from './math/MathLabel.jsx'
import {candidateSegments} from '../geometry/state/candidateStateGeometry.js'
import {slowWaveArcColors} from '../config/waveColors.js'
import {classifyWaveChain} from '../math/solution/waveChainClassification.js'
import {assessWaveChain} from '../math/solution/waveChainAssessment.js'
import {riemannCertificationReport} from '../math/solution/riemannCertificationReport.js'

const number=x=>Number.isFinite(x)?Number(x.toPrecision(6)).toString():'—'
const state=U=>U?`(${U.map(number).join(', ')})`:'—'
const names={shock:'Choque',contact:'Contato',rarefaction:'Rarefação'}
const stateEnclosure=U=>U.map(([lo,hi])=>`[${((Math.floor(lo*1e8)-1)/1e8).toFixed(8)}, ${((Math.ceil(hi*1e8)+1)/1e8).toFixed(8)}]`).join(' × ')
export const chainSegmentColors = {
  shock:slowWaveArcColors.localShock,
  composite:slowWaveArcColors.composite,
  compositeRarefaction:slowWaveArcColors.rarefaction,
  contact:'#bf5af2',
  rarefaction:'#54afff',
}

export function chainSegmentColorKeys(candidate,segments){
  const blockTypes=candidate?.blocks?.flatMap(block=>block.segments.map(()=>block.type))
  return segments.map((segment,index)=>{
    const belongsToComposite=blockTypes?.length===segments.length&&blockTypes[index]==='K'
    if(!belongsToComposite)return segment.type
    return segment.type==='rarefaction'?'compositeRarefaction':'composite'
  })
}
export const sonicJunctionLabel=(index,count)=>count===1?'U_K':`U_{K_${index+1}}`
const chainSegmentSymbols = {shock:'S',contact:'C',rarefaction:'R'}

const diagnosticStatus={
  'numerically-compatible':'Compatível numericamente',
  'violation-detected':'Violação detectada',discontinuous:'Descontinuidade detectada',
  reversed:'Ordem invertida',unverified:'Não verificado',
  'not-applicable':'Não aplicável','necessary-rh-checks-passed':'Verificações necessárias de RH satisfeitas',
  'sampled-speed-ordered':'Velocidades amostradas ordenadas',
  'strict-endpoint-configuration':'Configuração estrita de extremos',
  'not-established':'Não estabelecido','not-evaluated':'Não avaliado',
  'sampled-violation-detected':'Violação amostrada detectada',
  'no-sampled-violation':'Sem violação nas amostras',inconclusive:'Inconclusivo',
  'continuous-liu-compatible':'Admissível pelo critério de Liu no arco contínuo, à tolerância numérica',
  'continuous-liu-violation':'Violação de Liu no arco contínuo',
  'validated-liu':'Validado em todo o arco pelo critério de Liu',
  'validated-sonic-endpoints':'Condições sônicas não estritas validadas',
  'validated-strict-lax':'Desigualdades estritas de Lax validadas',
}
const diagnosticLabel=status=>diagnosticStatus[status]??status??'Não verificado'
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
        <details><summary>Tentativas de contatos e compostas</summary>{report.attempts.map((attempt,i)=><p key={i}>{i+1}. {attempt.pattern}: {reason(attempt.status)}{attempt.middle&&<> · <MathLabel>U_M=</MathLabel> {state(attempt.middle)}</>}{Number.isFinite(attempt.speedGap)?` · diferença de velocidades = ${number(attempt.speedGap)}`:''}</p>)}</details>
      </>}
      {report.sampledIntersections!==undefined&&<p>Interseções amostradas: {report.sampledIntersections}; refinadas: {report.refined??0}.</p>}
      {(report.rejected??[]).map((r,i)=><small key={i}>Tentativa {i+1}: {reason(r.status??r.reason??'inconclusive')}</small>)}
      {(report.profileAssessments??[]).filter(a=>a.profileStatus!=='sampled-candidate').map(a=><details key={`assessment-${a.index}`}><summary>Candidato geométrico {a.index+1}: {reason(a.profileStatus)}</summary>
        <p><MathLabel>U_M=</MathLabel> {state(a.middle)}</p>
        {a.refinement&&<p>Correção: {reason(a.refinement)}.</p>}
        {a.chain&&<p>Conservação e velocidades: {reason(a.chain)}.</p>}
        {a.family&&<p>Famílias: {reason(a.family)}.</p>}
        {a.firstShock&&<p>Primeiro salto: {reason(a.firstShock)}.</p>}
        {a.secondShock&&<p>Segundo salto: {reason(a.secondShock)}.</p>}
        {Number.isFinite(a.speedGap)&&<p>Diferença <MathLabel>s_2-s_1</MathLabel>: {number(a.speedGap)}.</p>}
        {a.fan&&<p>Leque: {reason(a.fan)}.</p>}
      </details>)}
      {(report.profileRejections??[]).map((value,i)=><small key={`profile-${i}`}>Perfil não selecionável: {reason(value)}</small>)}
    </details>)}
    {stateBranches&&<details><summary>Domínio e paradas dos ramos de choque</summary>
      <small>Continuação característica nos estados: até {stateBranches.limits.maxSteps} passos por ramo, passo {stateBranches.limits.step} vezes a escala dos estados, raio máximo {stateBranches.limits.maxRadius} vezes a mesma escala. Curvas projetadas disponíveis também fornecem sementes. Busca sem completude global.</small>
      {stateBranches.stops.map((s,i)=><p key={i}><MathLabel>{s.side==='left'?'U_L':'U_R'}</MathLabel> · família {s.family==='slow'?1:2} · sentido {s.sign??'—'}: {s.reason}</p>)}
    </details>}
    <small>Nos blocos compostos, o contato também pode ter direção e velocidade constantes ao longo de uma reta horizontal ou vertical. K lenta: R–S. K rápida: S–R.</small>
  </div>
}

export function CandidateChainSummary({candidate}){
  const segments=candidateSegments(candidate)
  const middle=candidate.middle??candidate.states?.[1]
  const states=[segments[0]?.from,middle,segments.at(-1)?.to]
  return <dl className="candidateChainSummary" aria-label="Estados e velocidades da cadeia">
    {['U_L','U_M','U_R'].map((tex,i)=><div key={tex}>
      <dt><MathLabel>{tex}</MathLabel></dt><dd>{state(states[i])}</dd>
    </div>)}
    {segments.map((segment,i)=><div key={i}>
      <dt><MathLabel>{segment.type==='rarefaction'?
        String.raw`[\lambda_{${i+1}}^-,\lambda_{${i+1}}^+]`: `s_{${i+1}}`}</MathLabel></dt>
      <dd>{segment.type==='rarefaction'?
        `[${number(segment.speeds?.[0])}, ${number(segment.speeds?.at(-1))}]`:number(segment.speed)}</dd>
    </div>)}
  </dl>
}

export default function StateChainInspection({candidate,geometry,p,label='Ondas da cadeia selecionada',onSegmentFocus}){
  const classification=p?classifyWaveChain(candidate,p,geometry):null
  const assessment=assessWaveChain(classification)
  const certification=candidate.pattern==='KR'&&classification
    ?riemannCertificationReport(candidate,classification,p):null
  const ssValidation=classification?.validation?.pattern==='SS'?classification.validation:null
  const segments=geometry?.segments??candidateSegments(candidate)
  const segmentColorKeys=chainSegmentColorKeys(candidate,segments)
  return <section className="stateChainInspection" aria-label={label}>
    <CandidateChainSummary candidate={candidate}/>
    <p className="chainPanelQualification">{ssValidation?'Solução SS validada pelo critério de Liu.':certification?.status==='validated'?
      'Solução KR validada pelo critério de Liu.':candidate.evidence?.liu==='liu-violation-detected'?
      'Violação de Liu detectada nas amostras.':'Admissibilidade entrópica inconclusiva.'}</p>
    {segments.map((s,i)=><details key={i} className="stateChainSegment"
      onMouseEnter={()=>onSegmentFocus?.(i)} onMouseLeave={()=>onSegmentFocus?.(null)}
      onFocus={()=>onSegmentFocus?.(i)} onBlur={event=>{
        if(!event.currentTarget.contains(event.relatedTarget))onSegmentFocus?.(null)
      }}>
      <summary>
        <span className="stateChainSegmentKey" style={{color:chainSegmentColors[segmentColorKeys[i]]}}>
          <MathLabel>{`${chainSegmentSymbols[s.type]}_{${i+1}}`}</MathLabel>
        </span>
        <span>{names[s.type]}{s.family==='slow'?' · lenta':s.family==='fast'?' · rápida':''}
          {['composite','compositeRarefaction'].includes(segmentColorKeys[i])&&' · composta'}</span>
      </summary>
      <p>{state(s.from)} → {state(s.to)}</p>

      {s.rh&&<p>RH: {s.rh.rankineHugoniot?'compatível numericamente':'inconclusivo'} · resíduo relativo {number(s.rh.relativeResidual)}</p>}
      {s.type==='rarefaction'&&<small>Leque interpolado sobre a curva integral amostrada; verificações numéricas de crescimento e hiperbolicidade.</small>}
      {s.type==='contact'&&<small>Contato verificado no modelo de direção e velocidade constantes.</small>}
      {s.arc&&<small>Arco de choque: {s.arc.points.length>1?'continuação RH conectada numericamente':'inconclusivo; apenas extremos assinalados'}.</small>}
      {s.sonicSide&&<small>Salto interno de K · junção sônica {s.sonicSide} · Lax não estrito.</small>}
    </details>)}
    {classification&&<details><summary>Diagnóstico da cadeia</summary>
      <div style={{display:'grid',gap:8,minWidth:0,overflowWrap:'anywhere'}}>
        <div role="status"><strong>Síntese das verificações</strong><div>{assessment.status==='validated'?'Solução de Riemann validada · Liu':assessment.status==='incompatible'?'Incompatibilidade detectada':assessment.status==='inconclusive'?'Diagnóstico inconclusivo':'Compatibilidade numérica (não certificada)'}</div>{assessment.reasons.map((reason,i)=><div key={i}>{reason}</div>)}</div>
        <div><strong>Conservação</strong><div>{diagnosticLabel(classification.weakSolution.status)}</div></div>
        <div><strong>Continuidade</strong><div>{diagnosticLabel(classification.chainGeometry.continuity.status)}</div></div>
        <div><strong>Velocidades globais</strong><div>{diagnosticLabel(classification.chainGeometry.speedOrdering.status)}</div></div>
        {classification.chainGeometry.junctions.map(j=><div key={j.index} style={{borderTop:'1px solid var(--border, #444)',paddingTop:6}}>
          <strong>Junção {j.index+1}</strong>
          <div>Continuidade: {diagnosticLabel(j.continuity.status)}</div>
          <div>Velocidades: {diagnosticLabel(j.speedOrdering.status)}</div>
        </div>)}
        {classification.waves.map(w=><div key={w.index} style={{borderTop:'1px solid var(--border, #444)',paddingTop:6,minWidth:0}}>
          <strong>Onda {w.index+1} · {names[w.type]??w.type}
            {w.type==='shock'&&(w.family==='slow'?' lento':w.family==='fast'?' rápido':'')}</strong>
          <div>RH: {diagnosticLabel(w.conservation.status)}</div>
          <div>Espectro: {w.spectral?.label??'Não classificado'}</div>
          <div>Lax: {diagnosticLabel(w.admissibility.lax.status)}</div>
          <div>Liu: {diagnosticLabel(w.admissibility.liu.status)}</div>
          {ssValidation&&w.admissibility.liu.speedEnclosure&&<div>
            <MathLabel>{'\\sigma'}</MathLabel> ∈ {stateEnclosure([w.admissibility.liu.speedEnclosure])}
          </div>}
          {Number.isFinite(w.admissibility.liu.speed)&&<div>
            Velocidade do choque <MathLabel>{'\\sigma'}</MathLabel> = {number(w.admissibility.liu.speed)}
            {Number.isFinite(w.admissibility.liu.tolerance)&&
              <> · tolerância {w.admissibility.liu.tolerance.toExponential(2)}</>}
          </div>}
          <div>Perfil viscoso: {diagnosticLabel(w.admissibility.viscousProfile.status)}</div>
        </div>)}
        {ssValidation&&<div className="chainCertificationReport">
          <strong>Certificação da solução de Riemann · SS</strong>
          <p>Os dois saltos satisfazem Rankine–Hugoniot, Lax e Liu. A ordem das velocidades garante a faixa de estado constante intermediário no perfil autossimilar.</p>
          <div><MathLabel>{'U_M'}</MathLabel> ∈ {stateEnclosure(ssValidation.middleState)}</div>
          <p>Inclusão de Krawczyk e aritmética com arredondamento externo para os coeficientes e dados iniciais armazenados.</p>
        </div>}
        {certification&&<div className="chainCertificationReport" style={{borderTop:'1px solid var(--border, #444)',paddingTop:6}}>
          <strong>Certificação da solução de Riemann · KR</strong>
          <p>{certification.status==='validated'?'Cadeia completa validada pelo critério de Liu.':'Critério de admissibilidade adotado — Liu. Cadeia completa ainda sem certificação.'}</p>
          <div>Dados iniciais <MathLabel>{'U_L,\\ U_R'}</MathLabel> — {certification.boundariesMatch?'extremos conferidos numericamente':'ligação pendente'}</div>
          {certification.fans.map(fan=><p key={fan.index}>
            Rarefação {fan.family==='slow'?'lenta':'rápida'} — {fan.checked} estados verificados.
            {' '}Hiperbolicidade {fan.status==='sampled'?'nas amostras confirmada':'não verificada'};
            {' '}velocidades {fan.ordered?'ordenadas nas amostras':'não verificadas'}.
            {fan.status==='sampled'&&<> <MathLabel>{'\\min\\Delta'}</MathLabel> = {number(fan.minimumDiscriminant)};
              {' '}erro máximo em <MathLabel>{'\\lambda'}</MathLabel> = {number(fan.maximumSpeedError)}.</>}
          </p>)}
          {certification.shocks.map(shock=><p key={shock.index}>
            Choque lento — resíduo relativo RH {number(shock.rhResidual)}.
            {' '}Ligação sônica {shock.sonicStatus==='numerically-compatible'?'conferida numericamente':'pendente'};
            {' '}diferença <MathLabel>{'|\\sigma-\\lambda_s(U_K)|'}</MathLabel> = {number(shock.sonicSpeedError)}.
          </p>)}
          {certification.status==='validated'?<>
            <p>As duas rarefações foram validadas entre as amostras, com hiperbolicidade e crescimento estrito da velocidade. O fechamento das junções e a igualdade sônica foram validados por inclusão de uma raiz das equações contínuas.</p>
            <p>Liu foi validado por fatoração algébrica no arco completo. A montagem autossimilar satisfaz a lei de conservação, os dados iniciais e a ordem das velocidades.</p>
            <div><MathLabel>{'U_K'}</MathLabel> — {stateEnclosure(certification.validation.sonicState)}</div>
            <div><MathLabel>{'U_M'}</MathLabel> — {stateEnclosure(certification.validation.middleState)}</div>
            <p>Erro máximo por coordenada dos estados desenhados — <MathLabel>{'U_K'}</MathLabel> {number(certification.validation.sonicStateError)};
              {' '}<MathLabel>{'U_M'}</MathLabel> {number(certification.validation.middleStateError)}.</p>
            <p>Integração de Taylor com arredondamento externo, inclusão de Krawczyk e fatoração de Liu. Validação referente aos coeficientes e dados iniciais armazenados no laboratório.</p>
          </>:<>
            <strong>O que falta validar</strong>
            <ul>{certification.pending.map(item=><li key={item}>{item}</li>)}</ul>
          </>}
        </div>}
        {!ssValidation&&certification?.status!=='validated'&&<small>Verificações numéricas necessárias, sem prova distribucional ou certificação de entropia. A seleção de candidatos não é alterada.</small>}
      </div>
    </details>}
    {geometry&&!geometry.complete&&<p role="status">Construção gráfica parcial: há arco de choque inconclusivo. Os extremos estão assinalados; nenhum segmento reto substitui o arco.</p>}
    {geometry?.junctions.map((U,i)=><p key={i}>Junção sônica <MathLabel>{sonicJunctionLabel(i,geometry.junctions.length)}</MathLabel> = {state(U)}</p>)}
    <details><summary>Critérios e limitações do candidato</summary>
      {Object.entries(candidate.evidence??{}).filter(([,v])=>typeof v==='string').map(([key,value])=><p key={key}>{key}: {value}</p>)}
      <small>Os estados dos critérios acima são os retornados pelos construtores. Conservação, Lax de extremos e ausência de violação amostrada de Liu não certificam entropia. Critérios ausentes permanecem não avaliados.</small>
    </details>
  </section>
}

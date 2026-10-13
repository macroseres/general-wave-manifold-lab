import { continuationSummary } from '../geometry/composite/continuationSummary.js'

function SideAudit({ label, diagnostics }) {
  const audit = continuationSummary(diagnostics)
  return <div className="continuationAuditSide">
    <strong>{label}</strong>
    {!audit.available ? <span>Auditoria indisponível</span> : <>
      <span>{audit.events === 0 ? 'Nenhum evento sinalizado' : `${audit.events} evento(s) não classificado(s)`}</span>
      <small>{audit.traces} trajetórias · {audit.samples} amostras</small>
      {audit.events > 0 && <small>Contagem de raízes: {audit.rootCountChanges} · correspondências ambíguas: {audit.competingRoots}</small>}
    </>}
  </div>
}

/** The audit is diagnostic only; it does not alter or classify the geometric curves. */
export default function ContinuationAuditPanel({ minus, plus, showMinus, showPlus, children }) {
  if (!showMinus && !showPlus) return null
  return <section className="continuationAuditPanel" aria-label="Auditoria de continuação das curvas compostas">
    <div className="continuationAuditHeading"><strong>Continuação de 𝒦±</strong><span>Diagnóstico numérico</span></div>
    {showMinus && <SideAudit label="𝒦₋" diagnostics={minus} />}
    {showPlus && <SideAudit label="𝒦₊" diagnostics={plus} />}
    <small>Eventos sinalizados não constituem prova de bifurcação. A auditoria não altera os ramos.</small>
    <details><summary>Ver certificação geométrica detalhada</summary>{children}</details>
  </section>
}

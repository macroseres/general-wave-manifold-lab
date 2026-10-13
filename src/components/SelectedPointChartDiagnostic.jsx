import {useMemo} from 'react'
import {selectedPointDiagnostic} from '../math/charts/selectedPointDiagnostic.js'
const fmt=x=>Number.isFinite(x)?Number(x).toPrecision(6):'—'
export default function SelectedPointChartDiagnostic({point,p}){
  const d=useMemo(()=>selectedPointDiagnostic(point,p),[point,p])
  return <details className="inspectorSection" open={d.nearInfinity}>
    <summary>Carta do ponto selecionado</summary>
    <div className="inspectorSectionBody">
      {d.kind==='regular'?<>
        <p><b>Carta preferencial:</b> {d.nearInfinity?'recíproca Z=1/z':'finita z'}</p>
        <p><b>z_c:</b> {fmt(point.zc)} · <b>z:</b> {fmt(d.z)}</p>
        <p><b>Z=1/z:</b> {fmt(d.Z)} · <b>Ŷ=zY:</b> {fmt(d.X)}</p>
        {d.reciprocal?.kind==='regular'&&<><p><b>Coordenada livre:</b> {fmt(d.reciprocal.free)} ({d.reciprocal.coordinate})</p><p><b>Amplitude recíproca Ŷ:</b> {fmt(d.reciprocal.X)}</p></>}
        {d.nearInfinity&&<p role="status">{d.warning}</p>}
        {d.largePhysicalValues&&<p><b>Atenção:</b> grande magnitude física ({fmt(d.physicalMagnitude)}); isso, isoladamente, não prova instabilidade numérica.</p>}
        {d.reciprocal&&d.reciprocal.kind!=='regular'&&<p>Transição indisponível: {d.reciprocal.kind}</p>}
      </>:<p>Diagnóstico indisponível: {d.kind}</p>}
    </div>
  </details>
}

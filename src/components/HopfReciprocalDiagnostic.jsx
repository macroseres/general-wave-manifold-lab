import {useMemo,useState} from 'react'
import {projectReciprocalHopfPoint} from '../geometry/hopf/reciprocalProjection.js'

const number = value => Number.isFinite(value) ? value.toFixed(5) : '—'

/** Inspection-only chart probe. Never overlays reciprocal coordinates on the finite 3D scene. */
export default function HopfReciprocalDiagnostic({p}) {
  const [side,setSide]=useState('minus')
  const [view,setView]=useState('state-amplitude')
  const [free,setFree]=useState(0)
  const [X,setX]=useState(0)
  const [Z,setZ]=useState(0)
  const result=useMemo(()=>projectReciprocalHopfPoint(free,X,Z,p,side,{view}),[free,X,Z,p,side,view])
  return <details className="inspectorSection" id="hopf-reciprocal-diagnostic">
    <summary>Hopf — carta recíproca (diagnóstico)</summary>
    <div className="inspectorSectionBody hopfReciprocalDiagnostic">
      <small>Amostra um ponto da carta Z=1/z, inclusive Z=0. Não altera a cena 3D.</small>
      <label>Superfície<select value={side} onChange={e=>setSide(e.target.value)}><option value="minus">Hopf⁻</option><option value="plus">Hopf⁺</option></select></label>
      <label>Projeção<select value={view} onChange={e=>setView(e.target.value)}><option value="state-amplitude">(ū, v̄, X)</option><option value="state-direction">(ū, v̄, Z)</option></select></label>
      <label>Coordenada livre<input type="number" step="0.1" value={free} onChange={e=>setFree(Number(e.target.value))}/></label>
      <label>X<input type="number" step="0.1" value={X} onChange={e=>setX(Number(e.target.value))}/></label>
      <label>Z<input type="number" step="0.01" value={Z} onChange={e=>setZ(Number(e.target.value))}/></label>
      {result.kind==='regular'?<div aria-live="polite">
        <p><b>(ū, v̄, X, Z):</b> ({result.coordinates4.map(number).join(', ')})</p>
        <p><b>Projeção:</b> ({result.position.map(number).join(', ')})</p>
        <p><b>Coordenada omitida:</b> {number(result.omitted)}</p>
        <p><b>Traço:</b> {result.trace.toExponential(3)} · <b>Determinante:</b> {result.det.toExponential(3)}</p>
        <p><b>Condição de Hopf:</b> {Math.abs(result.trace)<1e-7&&result.det>0?'satisfeita neste ponto':'não satisfeita neste ponto'}</p>
      </div>:<p role="status">Ponto não regular: {result.kind}</p>}
      <small>Projeções diagnósticas não são necessariamente injetivas. Nenhuma triangulação é transferida para (τ,Y,z_c).</small>
    </div>
  </details>
}

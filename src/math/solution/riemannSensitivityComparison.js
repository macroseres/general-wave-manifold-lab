// Comparison of already-computed, projection-specific numerical diagnostics.
// Never interpret missing roots as zero displacement or compare distinct branches as identical.
export function compareHugoniotSensitivity(a,b){
  if(!a||!b)return {status:'unavailable',rows:[]}
  const ta=a.coefficientSensitivity?.trials
  const tb=b.coefficientSensitivity?.trials
  if(!Array.isArray(ta)||!Array.isArray(tb))return {status:'unavailable',rows:[]}
  const byName=new Map(tb.map(t=>[t.coefficient,t]))
  const rows=ta.filter(t=>byName.has(t.coefficient)).map(t=>{
    const other=byName.get(t.coefficient)
    const derivativeA=Number.isFinite(t.centralDerivative)?t.centralDerivative:null
    const derivativeB=Number.isFinite(other.centralDerivative)?other.centralDerivative:null
    return {coefficient:t.coefficient,derivativeA,derivativeB,
      difference:derivativeA!==null&&derivativeB!==null?derivativeA-derivativeB:null,
      complete:derivativeA!==null&&derivativeB!==null}
  })
  return {status:rows.length?'comparison-available':'unavailable',rows,
    comparableCount:rows.filter(r=>r.complete).length,
    largestDerivativeDifference:rows.reduce((m,r)=>r.difference===null?m:Math.max(m,Math.abs(r.difference)),0)}
}

/** Compare physical coordinate responses on each *fixed* sampled Hugoniot segment.
 * A derivative is unavailable if either perturbed root was not tracked.
 * These are not derivatives of a fully recomputed Riemann intermediate state.
 */
export function compareHugoniotCoordinateSensitivity(a,b){
  if(!a||!b)return {status:'unavailable',rows:[],comparableCount:0}
  const ta=a.coefficientSensitivity?.trials,tb=b.coefficientSensitivity?.trials
  if(!Array.isArray(ta)||!Array.isArray(tb))return {status:'unavailable',rows:[],comparableCount:0}
  const byName=new Map(tb.map(t=>[t.coefficient,t]))
  const direction=arc=>Array.isArray(arc.segmentStart)&&Array.isArray(arc.segmentEnd)
    ?arc.segmentEnd.map((v,i)=>v-arc.segmentStart[i]):null
  const coord=(trial,arc)=>{
    if(!trial)return null
    const d=direction(arc)
    const derivative=Number.isFinite(trial.centralDerivative)?trial.centralDerivative:null
    const value=Array.isArray(trial.coordinateDerivative)?trial.coordinateDerivative
      :d&&derivative!==null?d.map(v=>v*derivative):null
    return Array.isArray(value)&&value.length===2&&value.every(Number.isFinite)?value:null
  }
  const rows=ta.filter(t=>byName.has(t.coefficient)).map(t=>{
    const coefficient=t.coefficient
    const derivativeA=coord(t,a),derivativeB=coord(byName.get(coefficient),b)
    const difference=derivativeA&&derivativeB?derivativeA.map((v,i)=>v-derivativeB[i]):null
    return {coefficient,derivativeA,derivativeB,difference,complete:difference!==null}
  })
  return {status:rows.length?'comparison-available':'unavailable',rows,
    comparableCount:rows.filter(r=>r.complete).length}
}

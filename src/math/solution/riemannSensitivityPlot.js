// Presentation-only transformation: offsets refer to the parameter along a
// sampled Hugoniot segment, not physical time or a state-space displacement.
export function sensitivityPlotRows(trials){
  if(!Array.isArray(trials))return []
  return trials.filter(t=>typeof t.coefficient==='string').map(t=>({
    coefficient:t.coefficient,
    minus:Number.isFinite(t.minus)?t.minus:null,
    plus:Number.isFinite(t.plus)?t.plus:null,
    unresolved:!Number.isFinite(t.minus)||!Number.isFinite(t.plus)
  }))
}
export function sensitivityPlotScale(rows){
  const magnitudes=rows.flatMap(r=>[r.minus,r.plus]).filter(Number.isFinite).map(Math.abs)
  return magnitudes.length?Math.max(...magnitudes,1e-15):null
}

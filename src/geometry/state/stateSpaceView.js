import {statePointToUnit} from './stateSpace.js'

// Viewport retangular: escalas visuais independentes nos eixos u e v.
// As coordenadas de estado e as equações não são alteradas.
export const shockStopLabel=reason=>({
  'radius-limit':'Limite numérico de raio',
  'max-steps':'Limite numérico de passos',
  'sample-limit':'Fim da amostragem disponível',
  'lax-endpoint-boundary':'Lax estrito deixou de ser verificado; fronteira não refinada',
  'hyperbolicity-unverified':'Hiperbolicidade estrita deixou de ser verificada',
  'rh-unverified':'Rankine–Hugoniot deixou de ser verificado',
  'singular-gradient':'Gradiente singular na continuação numérica',
  'corrector-failed':'Falha do corretor numérico',
  'loop-detected':'Retorno numérico a um trecho já visitado',
}[reason]??`Continuação interrompida: ${reason}`)
export const W=1040,H=680,P=64
export const sx=(q,g)=>P+statePointToUnit(q,g).x*(W-2*P)
export const sy=(q,g)=>H-P-statePointToUnit(q,g).y*(H-2*P)
export const pathData=(points,g)=>points.map((q,i)=>`${i?'L':'M'} ${sx(q,g).toFixed(2)} ${sy(q,g).toFixed(2)}`).join(' ')
// Graduação independente dos eixos: números legíveis mesmo após zoom/pan.
export const axisTicks=(min,max,target=8)=>{
  const span=max-min
  if(!Number.isFinite(span)||span<=0)return []
  const rough=span/target,base=10**Math.floor(Math.log10(rough))
  const step=[1,2,2.5,5,10].map(n=>n*base).find(n=>n>=rough)??10*base
  const start=Math.ceil((min-1e-10*span)/step)*step
  const count=Math.min(100,Math.ceil((max-start)/step)+1)
  return Array.from({length:count},(_,i)=>Number((start+i*step).toPrecision(12))).filter(v=>v>=min-1e-10*span&&v<=max+1e-10*span)
}
export const axisLabel=value=>Math.abs(value)<1e-10?'0':Number(value.toPrecision(5)).toString()
export const finiteNumber=value=>Number.isFinite(Number(value))?Number(value):null
export const validWindow=w=>w&&[w.uMin,w.uMax,w.vMin,w.vMax].every(Number.isFinite)&&w.uMin<w.uMax&&w.vMin<w.vMax
const robustExtent=values=>{
  const a=values.filter(Number.isFinite).sort((x,y)=>x-y)
  if(!a.length)return null
  const pick=q=>a[Math.min(a.length-1,Math.max(0,Math.floor(q*(a.length-1))))]
  return a.length<20?[a[0],a[a.length-1]]:[pick(.05),pick(.95)]
}
export const fittedWindow=(g,fixedState=null,requiredStates=[])=>{
  // The viewport follows the rarefaction geometry, not the currently inspected point P in the wave manifold.
  // This keeps state selection independent from 3D inspection, even when P is near projective infinity.
  const curvePts=g.curves.flatMap(c=>c.points??[])
  const pts=curvePts.length?curvePts:g.projection?[g.projection.minus,g.projection.plus,g.projection.mean]:g.anchorPoints
  let ue=robustExtent(pts.map(q=>q.u)),ve=robustExtent(pts.map(q=>q.v))
  if(!ue||!ve)return {uMin:g.uMin,uMax:g.uMax,vMin:g.vMin,vMax:g.vMax}
  // Keep the scientific geometry central, but always include the selected state U*.
  if(fixedState?.every(Number.isFinite)){ue=[Math.min(ue[0],fixedState[0]),Math.max(ue[1],fixedState[0])];ve=[Math.min(ve[0],fixedState[1]),Math.max(ve[1],fixedState[1])]}
  // Candidate states and arcs must never be trimmed by the geometry quantiles.
  for(const U of requiredStates)if(Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)){
    ue=[Math.min(ue[0],U[0]),Math.max(ue[1],U[0])]
    ve=[Math.min(ve[0],U[1]),Math.max(ve[1],U[1])]
  }
  const uSpan=Math.max(.12,ue[1]-ue[0]),vSpan=Math.max(.12,ve[1]-ve[0]),span=Math.max(uSpan,vSpan)
  const pad=.12, uMid=(ue[0]+ue[1])/2, vMid=(ve[0]+ve[1])/2,half=span*(.5+pad)
  const uHalf=half+0.08*span
  return {uMin:uMid-uHalf,uMax:uMid+uHalf,vMin:vMid-half,vMax:vMid+half}
}

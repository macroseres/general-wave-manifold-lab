import {MathBlock,MathLabel} from './math/MathLabel.jsx'

const num=value=>Number.isFinite(value)?Number(value).toPrecision(5):null
const state=values=>Array.isArray(values)&&values.length===2&&values.every(Number.isFinite)?String.raw`\binom{${num(values[0])}}{${num(values[1])}}`:null
const texSpeed=value=>num(value)??String.raw`\text{não disponível}`

function candidateFormula(candidate){
  if(!candidate||candidate.status!=='sampled-candidate')return null
  const left=state(candidate.left??candidate.states?.[0])
  const right=state(candidate.right??candidate.states?.at(-1))
  const middle=state(candidate.middle??candidate.states?.[1])
  if(!left||!right||!middle)return null
  if(candidate.kind==='two-shock'&&candidate.speeds?.length===2&&candidate.speeds.every(Number.isFinite)){
    const [a,b]=candidate.speeds
    if(a>b)return null
    return String.raw`V(\xi)=\begin{cases}${left},&\xi<${texSpeed(a)}\\[7pt]${middle},&${texSpeed(a)}<\xi<${texSpeed(b)}\\[7pt]${right},&\xi>${texSpeed(b)}\end{cases}`
  }
  if(!Number.isFinite(candidate.shockSpeed)||!Array.isArray(candidate.fanSpeeds)||candidate.fanSpeeds.length<2)return null
  const a=candidate.fanSpeeds[0],b=candidate.fanSpeeds.at(-1),s=candidate.shockSpeed
  if(![a,b].every(Number.isFinite)||a>b)return null
  if(candidate.kind==='rarefaction-shock'&&b<=s){
    return String.raw`V(\xi)=\begin{cases}${left},&\xi<${texSpeed(a)}\\[7pt]R(\xi),&${texSpeed(a)}\le\xi\le${texSpeed(b)}\\[7pt]${middle},&${texSpeed(b)}<\xi<${texSpeed(s)}\\[7pt]${right},&\xi>${texSpeed(s)}\end{cases}`
  }
  if(candidate.kind==='shock-rarefaction'&&s<=a){
    return String.raw`V(\xi)=\begin{cases}${left},&\xi<${texSpeed(s)}\\[7pt]${middle},&${texSpeed(s)}<\xi<${texSpeed(a)}\\[7pt]R(\xi),&${texSpeed(a)}\le\xi\le${texSpeed(b)}\\[7pt]${right},&\xi>${texSpeed(b)}\end{cases}`
  }
  return null
}

export default function PhysicalSolutionExpressions({candidate,solution}){
  const formula=candidate?candidateFormula(candidate):solution?.kind==='rarefaction'&&solution.states?.length>1?
    String.raw`V(\xi)=\begin{cases}${state([solution.states[0].u,solution.states[0].v])},&\xi<${texSpeed(solution.xiMin)}\\[7pt]R(\xi),&${texSpeed(solution.xiMin)}\le\xi\le${texSpeed(solution.xiMax)}\\${state([solution.states.at(-1).u,solution.states.at(-1).v])},&\xi>${texSpeed(solution.xiMax)}\end{cases}`:null
  return <section className="physicalExpressions" aria-label="Expressões da realização física">
    <div className="physicalExpressionsHeader"><h3>Expressões da realização física</h3><span className="physicalExpressionStatus">{candidate?'Cadeia candidata · não certificada':'Órbita selecionada · não certificada'}</span></div>
    <MathBlock>{String.raw`U(x,t)=V(\xi),\qquad \xi=\frac{x}{t},\quad t>0`}</MathBlock>
    {formula?<div className="physicalExpressionFormula"><MathBlock>{formula}</MathBlock></div>:<p className="physicalExpressionNote">Não há expressão por trechos validada para a seleção atual. Os estados e as velocidades disponíveis são insuficientes ou não estão ordenados.</p>}
    <p className="physicalExpressionNote"><MathLabel>{String.raw`R(\xi)`}</MathLabel> representa o perfil do leque calculado numericamente, não uma fórmula fechada. As fronteiras de choque devem ser interpretadas por traços laterais. A expressão não certifica admissibilidade entrópica.</p>
  </section>
}

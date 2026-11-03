import {coefficientKeys,discriminantPolynomial} from './affineClassification.js'
import {classifyConic,classifyQuadraticSigns} from './conicClassification.js'

// Finite, reproducible examples. They are witnesses, not an exhaustive atlas.
const zero=()=>Object.fromEntries(coefficientKeys.map(key=>[key,0]))
const make=(id,label,description,entries,expectedType)=>Object.freeze({
 id,label,description,expectedType,coefficients:Object.freeze({...zero(),...entries}),
})
export const parameterExamples=Object.freeze([
 make('ellipse','Elipse real','Δ = v² + 4u² − 4u; elipse real.',{a11:1,b20:.5,b10:-1},'elipse'),
 make('point','Ponto isolado','Δ = v² + 4u²; coincidência em um ponto.',{a11:1,b20:.5},'ponto isolado'),
 make('hyperbola','Hipérbole','Δ = v² − 4u² + 4u; hipérbole real.',{a11:1,b20:-.5,b10:1},'hipérbole'),
 make('parabola','Parábola','Δ = v² + 4u; parábola real.',{a11:1,b10:1},'parábola'),
 make('double-line','Reta dupla','Δ = v²; uma reta de multiplicidade dois.',{a11:1},'reta dupla'),
 make('whole-plane','Plano inteiro','Δ ≡ 0; jacobiano escalar constante.',{a10:2,b01:2},'identicamente nulo'),
])
export const parameterFilterOptions=Object.freeze([
 {id:'all',label:'Todas as geometrias'},
 ...parameterExamples.map(({id,label})=>({id,label})),
])
export function diagnoseParameterExample(example){
 const q=discriminantPolynomial(example.coefficients)
 const conic=classifyConic(q)
 const signs=classifyQuadraticSigns(q)
 const verified=conic.type===example.expectedType&&signs.evidence!=='numerically-inconclusive'
 return {q,conic,signs,verified}
}
export function filterParameterExamples(filter='all'){
 return parameterExamples.filter(example=>(filter==='all'||example.id===filter)&&diagnoseParameterExample(example).verified)
}

import { numericalPolicySnapshot } from '../math/numerics/policy.js'

export const EXPERIMENT_SCHEMA = 'general-wave-manifold-lab/experiment'
export const EXPERIMENT_SCHEMA_VERSION = 3

const COEFFICIENT_KEYS=['a20','a11','a02','a10','a01','b20','b11','b02','b10','b01']
const VISIBILITY_KEYS=['showSMinus','showSPlus','showRarefaction','showRareCurves','showFiniteStable','showFiniteUnstable','showInfinityStable','showInfinityUnstable']

function finiteNumber(value,name){
  if(typeof value!=='number'||!Number.isFinite(value))throw new Error(`${name} deve ser um número finito`)
  return value
}
function booleanValue(value,name){
  if(typeof value!=='boolean')throw new Error(`${name} deve ser booleano`)
  return value
}
function exactKeys(object,keys,name){
  if(!object||typeof object!=='object'||Array.isArray(object))throw new Error(`${name} inválido`)
  for(const key of keys)if(!(key in object))throw new Error(`${name}.${key} ausente`)
}
function copy(value){return JSON.parse(JSON.stringify(value))}
function validateRiemannState(value,name){
  if(value===null)return null
  if(!Array.isArray(value)||value.length!==2)throw new Error(`${name} deve conter duas coordenadas ou null`)
  return value.map((number,index)=>finiteNumber(number,`${name}[${index}]`))
}

export function createExperiment({appVersion,coefficients,samplingDomain,point,visibility,axisScale,riemannStates={left:null,right:null}}){
  return {
    schema:EXPERIMENT_SCHEMA,
    schemaVersion:EXPERIMENT_SCHEMA_VERSION,
    producer:{app:'general-wave-manifold-lab',version:appVersion},
    scientific:{
      flux:Object.fromEntries(COEFFICIENT_KEYS.map(key=>[key,coefficients[key]])),
      samplingDomain:{tauMin:samplingDomain.tauMin,tauMax:samplingDomain.tauMax,YMin:samplingDomain.YMin,YMax:samplingDomain.YMax},
      point:{tau:point.tau,Y:point.Y,zc:point.zc},
      riemannStates:{left:validateRiemannState(riemannStates.left,'riemannStates.left'),right:validateRiemannState(riemannStates.right,'riemannStates.right')},
      chartConvention:{finite:'z',reciprocal:'Z=1/z',visual:'zc=(2/pi) arctan(z)'},
      numericalPolicy:numericalPolicySnapshot(),
    },
    presentation:{
      visibility:Object.fromEntries(VISIBILITY_KEYS.map(key=>[key,visibility[key]])),
      axisScale:{tau:axisScale.tau,Y:axisScale.Y,zc:axisScale.zc},
    },
  }
}

function migrateExperiment(input){
  if(input?.schema===EXPERIMENT_SCHEMA&&input.schemaVersion===1&&input.scientific?.domain){
    const migrated=copy(input)
    migrated.schemaVersion=2
    migrated.scientific.samplingDomain=migrated.scientific.domain
    delete migrated.scientific.domain
    migrated.scientific.riemannStates={left:null,right:null}
    migrated.schemaVersion=3
    return migrated
  }
  if(input?.schema===EXPERIMENT_SCHEMA&&input.schemaVersion===2){
    const migrated=copy(input)
    migrated.schemaVersion=3
    migrated.scientific.riemannStates={left:null,right:null}
    return migrated
  }
  return input
}

export function validateExperiment(rawInput){
  const input=migrateExperiment(rawInput)
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Experimento deve ser um objeto JSON')
  if(input.schema!==EXPERIMENT_SCHEMA)throw new Error('Schema de experimento desconhecido')
  if(input.schemaVersion!==EXPERIMENT_SCHEMA_VERSION)throw new Error(`Versão de schema não suportada: ${input.schemaVersion}`)
  exactKeys(input.producer,['app','version'],'producer')
  if(input.producer.app!=='general-wave-manifold-lab')throw new Error('Experimento pertence a outro aplicativo')
  exactKeys(input.scientific,['flux','samplingDomain','point','chartConvention','numericalPolicy','riemannStates'],'scientific')
  exactKeys(input.scientific.flux,COEFFICIENT_KEYS,'scientific.flux')
  for(const key of COEFFICIENT_KEYS)finiteNumber(input.scientific.flux[key],`scientific.flux.${key}`)
  exactKeys(input.scientific.samplingDomain,['tauMin','tauMax','YMin','YMax'],'scientific.samplingDomain')
  for(const key of ['tauMin','tauMax','YMin','YMax'])finiteNumber(input.scientific.samplingDomain[key],`scientific.samplingDomain.${key}`)
  if(input.scientific.samplingDomain.tauMin>=input.scientific.samplingDomain.tauMax)throw new Error('Intervalo de amostragem inválido: tauMin deve ser menor que tauMax')
  if(input.scientific.samplingDomain.YMin>=input.scientific.samplingDomain.YMax)throw new Error('Intervalo de amostragem inválido: YMin deve ser menor que YMax')
  exactKeys(input.scientific.point,['tau','Y','zc'],'scientific.point')
  for(const key of ['tau','Y','zc'])finiteNumber(input.scientific.point[key],`scientific.point.${key}`)
  if(Math.abs(input.scientific.point.zc)>=1)throw new Error('Ponto inválido: |zc| deve ser menor que 1')
  exactKeys(input.scientific.riemannStates,['left','right'],'scientific.riemannStates')
  for(const side of ['left','right'])validateRiemannState(input.scientific.riemannStates[side],`scientific.riemannStates.${side}`)
  exactKeys(input.presentation,['visibility','axisScale'],'presentation')
  exactKeys(input.presentation.visibility,VISIBILITY_KEYS,'presentation.visibility')
  for(const key of VISIBILITY_KEYS)booleanValue(input.presentation.visibility[key],`presentation.visibility.${key}`)
  exactKeys(input.presentation.axisScale,['tau','Y','zc'],'presentation.axisScale')
  for(const key of ['tau','Y','zc'])if(finiteNumber(input.presentation.axisScale[key],`presentation.axisScale.${key}`)<=0)throw new Error(`presentation.axisScale.${key} deve ser positiva`)
  if(!input.scientific.numericalPolicy||typeof input.scientific.numericalPolicy!=='object')throw new Error('Política numérica ausente')
  return copy(input)
}

export function parseExperiment(text){
  let input
  try{input=JSON.parse(text)}catch{throw new Error('Arquivo não contém JSON válido')}
  return validateExperiment(input)
}

export function numericalPolicyMatchesCurrent(experiment){
  return JSON.stringify(experiment.scientific.numericalPolicy)===JSON.stringify(numericalPolicySnapshot())
}

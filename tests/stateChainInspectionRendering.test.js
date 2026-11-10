import test from 'node:test'
import assert from 'node:assert/strict'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {createServer} from 'vite'
import {physicalChainEvidence} from '../src/math/solution/physicalChainEvidence.js'

const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:5}
const profile={status:'sampled-candidate',kind:'two-shock',pattern:'SS',
  states:[[2,2],[0,2],[0,0]],speeds:[1,6]}
const candidate=statuses=>({...profile,evidence:physicalChainEvidence(profile,{
  chainEvidence:{status:'ordered-rh-candidate'},
  familyEvidence:{status:'ordered-lax-endpoint-candidate'},
  liuByWave:statuses.map(status=>({status})),
})})

test('SS inspection header and aggregate summary agree without approving absent evidence',async t=>{
  const server=await createServer({server:{middlewareMode:true,watch:null},appType:'custom'})
  try{
    const {default:Inspection}=await server.ssrLoadModule('/src/components/StateChainInspection.jsx')
    for(const scenario of [
      {name:'sampled violation',candidate:candidate(['no-sampled-violation','liu-violation-detected']),
        p,label:'Incompatibilidade detectada'},
      {name:'unresolved Liu',candidate:candidate(['no-sampled-violation','inconclusive']),
        p,label:'Diagnóstico inconclusivo'},
      {name:'compatible sampled checks',candidate:candidate(['no-sampled-violation','no-sampled-violation']),
        p,label:'Compatibilidade numérica (não certificada)'},
      {name:'missing evidence',candidate:profile,p,label:'Diagnóstico inconclusivo'},
      {name:'missing coefficients',candidate:candidate(['no-sampled-violation','no-sampled-violation']),
        label:'Diagnóstico inconclusivo'},
    ])await t.test(scenario.name,()=>{
      const html=renderToStaticMarkup(createElement(Inspection,{candidate:scenario.candidate,p:scenario.p}))
      const header=html.match(/<p>(.*?)<\/p>/)?.[1]
      assert.equal(header,`SS · ${scenario.label} · admissibilidade entrópica inconclusiva`)
      if(scenario.p){
        assert.ok(html.includes(`<strong>Síntese das verificações</strong><div>${scenario.label}</div>`))
      }else{
        assert.doesNotMatch(html,/Síntese das verificações/)
      }
      assert.doesNotMatch(html,/compatível com os testes necessários do construtor/)
      if(scenario.label!=='Compatibilidade numérica (não certificada)')
        assert.doesNotMatch(header,/Compatibilidade numérica/)
    })
  }finally{await server.close()}
})

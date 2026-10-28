import test from 'node:test'
import assert from 'node:assert/strict'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {createServer} from 'vite'
import {stateConstructionSearch} from '../src/math/solution/stateConstructionSearch.js'
import {riemannMonotoneRarefactions} from '../src/math/rarefaction/monotoneBranches.js'

const p={a20:3.3977518519014067,a11:0,a02:.5,a10:0,a01:0,b20:-.09349436579634296,b11:1,b02:-.1,b10:1,b01:0}
const states={left:[.4895020103438119,-.31089946517864675],right:[.7062767944010204,.7984334701516398]}
const search=(s,coefficients)=>stateConstructionSearch(s,riemannMonotoneRarefactions(s,coefficients),{left:[],right:[]},coefficients,true)

test('geometric candidates excluded from the selector retain their actual reasons',()=>{
  const result=search(states,p)
  const report=result.reports.find(r=>r.patterns==='SS')
  assert.ok(report.count>0)
  assert.equal(report.selectable,0)
  assert.equal(report.profileAssessments.length,report.count)
  assert.ok(report.profileAssessments.some(a=>a.profileStatus==='family-lax-unverified'&&a.secondShock==='strict-lax-failed'))
  assert.ok(report.profileAssessments.some(a=>a.profileStatus==='speed-ordering-unverified'&&a.speedGap<0))
  assert.equal(result.allProfiles.length,0)
})

test('selectable SS profiles are still offered after adding report assessments',()=>{
  const b={...p,a20:.5,a02:0,b20:0,b11:0,b02:.5,b10:0,b01:5}
  const result=search({left:[2,2],right:[0,0]},b)
  const report=result.reports.find(r=>r.patterns==='SS')
  assert.ok(report.selectable>0)
  assert.equal(report.profileAssessments.filter(a=>a.profileStatus==='sampled-candidate').length,report.selectable)
  assert.ok(result.allProfiles.some(q=>q.pattern==='SS'))
})

test('UI distinguishes raw candidates from selectable profiles and explains the empty list',async()=>{
  const server=await createServer({server:{middlewareMode:true,watch:null,hmr:false},appType:'custom'})
  try{
    const {StateConstructionReports}=await server.ssrLoadModule('/src/components/StateChainInspection.jsx')
    const result=search(states,p)
    const html=renderToStaticMarkup(createElement(StateConstructionReports,{reports:result.reports}))
    assert.match(html,/Candidatos geométricos sem perfil selecionável/)
    assert.match(html,/Candidatos geométricos:/)
    assert.match(html,/perfis selecionáveis: 0/)
    assert.match(html,/Lax estrito de extremos não satisfeito/)
    assert.match(html,/Ordenação das velocidades não verificada/)
    assert.doesNotMatch(html,/SS: Candidatos encontrados · 0/)
    const {default:Workspace}=await server.ssrLoadModule('/src/components/StateSpaceDialog.jsx')
    const props={open:true,inline:true,state:{kind:'degenerate'},p,tauMin:-1,tauMax:1,
      showRarefaction:false,riemannStates:states,constructionRequested:true,selectedCandidateIndex:-1,
      showLeftRiemannHugoniot:false,showRightRiemannHugoniot:false}
    const defaultView=renderToStaticMarkup(createElement(Workspace,props))
    assert.match(defaultView,/Nenhuma cadeia selecionada: arcos de choque e rarefação ocultos/)
    assert.doesNotMatch(defaultView,/aria-label="Ramo de choque (lento|rápido)/)
    assert.doesNotMatch(defaultView,/aria-label="Arco de rarefação (lenta|rápida)/)
    assert.doesNotMatch(defaultView,/aria-label="Cadeia candidata selecionada"/)
    assert.match(defaultView,/Resultados das buscas de cadeias/)
    const exploring=renderToStaticMarkup(createElement(Workspace,{...props,exploreWaveBranches:true}))
    assert.match(exploring,/aria-label="Ramo de choque lento de U L"/)
    assert.match(exploring,/aria-label="Arco de rarefação rápida retrospectiva de U R"/)
    const projected=renderToStaticMarkup(createElement(Workspace,{...props,showLeftRiemannHugoniot:true}))
    assert.match(projected,/data-riemann-side="left"/)
    assert.doesNotMatch(projected,/aria-label="Ramo de choque lento de U L"/)

  }finally{await server.close()}
})

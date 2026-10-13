import test from 'node:test'
import assert from 'node:assert/strict'
import {conicCategory,sampleParameterDiagram} from '../src/math/flux/parameterDiagram.js'
const p={a20:1,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:1,b10:0,b01:0}
test('diagrama amostra dois parâmetros mantendo os demais fixos',()=>{const cells=sampleParameterDiagram(p,'a20','b20',-1,1,-2,2,5);assert.equal(cells.length,25);assert.equal(cells[0].x,-.8);assert.equal(cells[0].y,1.6);assert.ok(cells.every(c=>typeof c.type==='string'));assert.equal(p.a20,1)})
test('categorias distinguem vazio, compacto e retas',()=>{assert.equal(conicCategory('elipse imaginária'),'vazio');assert.equal(conicCategory('ponto isolado'),'compacto');assert.equal(conicCategory('reta dupla'),'retas')})
test('eixos iguais são rejeitados',()=>assert.throws(()=>sampleParameterDiagram(p,'a20','a20',-1,1,-1,1)))

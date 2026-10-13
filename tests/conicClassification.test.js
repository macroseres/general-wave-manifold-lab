import test from 'node:test'
import assert from 'node:assert/strict'
import {classifyConic} from '../src/math/flux/conicClassification.js'
const q=(u2=0,uv=0,v2=0,u=0,v=0,c=0)=>({u2,uv,v2,u,v,c})
for(const [label,poly,expected] of [
 ['ellipse',q(1,0,1,0,0,-1),'elipse'],
 ['empty',q(1,0,1,0,0,1),'elipse imaginária'],
 ['point',q(1,0,1),'ponto isolado'],
 ['hyperbola',q(1,0,-1,0,0,-1),'hipérbole'],
 ['crossing lines',q(1,0,-1),'duas retas concorrentes'],
 ['parabola',q(1,0,0,0,-1),'parábola'],
 ['parallel lines',q(1,0,0,0,0,-1),'duas retas paralelas'],
 ['double line',q(1),'reta dupla'],
 ['line',q(0,0,0,1),'reta'],
 ['plane',q(),'identicamente nulo'],
 ['empty constant',q(0,0,0,0,0,1),'constante não nula'],
 ['rotated ellipse',q(2,2,2,0,0,-1),'elipse'],
 ['translated circle',q(1,0,1,-2,4,4),'elipse'],
]) test(label,()=>assert.equal(classifyConic(poly).type,expected))

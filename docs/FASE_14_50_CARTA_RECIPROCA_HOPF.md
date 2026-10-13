# Fase 14.50 — Carta recíproca e infinito projetivo das superfícies de Hopf

## Motivação

O diagnóstico anterior usava `z=tan(pi*zc/2)` e uma janela limitada de `tau,Y`. Essa janela não é invariante na mudança de carta; ausência de pontos amostrados perto de `zc=±1` não demonstra ausência geométrica de Hopf no infinito.

## Construção

Na carta recíproca, `Z=1/z`, direção `r=(1,Z)` e amplitude `X=u_+−u_-`, temos `U±=Ubar±(X/2)(1,Z)`. A condição de Rankine–Hugoniot é `Ghat(Ubar,Z)=(-Z,1)DF(Ubar)(1,Z)=0`; a velocidade é `s=(DF(Ubar)(1,Z))_1`. O sistema quadrático torna `Ghat` afim em `Ubar`; uma componente de `Ubar` é escolhida livre e a outra resolvida linearmente. Em `Z=0` esta carta permanece finita se a equação de autovetor é regular.

Para cada lado, a seção de traço zero é uma reta afim nas coordenadas `(free,X)`. Intersecta-se essa reta com uma janela explícita e verifica-se `det(DF(U±)−sI)>0` por amostragem. `Z=0` é o infinito de `z`, mas `X` não coincide com `Y` nem `free` com `tau`.

## Implementação

- `src/math/sonic/hopfReciprocal.js`: avaliação na carta recíproca e diagnóstico de seções.
- `scripts/audit-hopf-reciprocal.js`: auditoria em torno de `Z=0`.
- `tests/hopfReciprocal.test.js`: regularidade e traço nulo nas seções.

Execute `node scripts/audit-hopf-reciprocal.js` e `npm run check`.

## Limitações

Esta fase é **diagnóstica**: não altera a geometria 3D nem prolonga a malha automaticamente. A janela `(free,X)` é distinta da janela `(tau,Y)`; resultados não são diretamente comparáveis sem transformar os limites. A amostragem do determinante não prova inexistência global de componentes. Para visualização global contínua será necessário costurar as duas cartas com transições corretas, inclusive a troca de sinal da amplitude na geometria projetiva.

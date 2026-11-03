# Fase 15.6 — inspeção de curvas projetadas próximas e coincidentes

## Entregue
- Modo opcional **Inspecionar curvas projetadas** no Espaço de estados.
- Clique escolhe uma identidade de curva entre as que passam a até 11 unidades SVG do ponteiro; clique repetido alterna as identidades candidatas.
- Destaque visual da curva selecionada e indicação da origem (`Rarefação` ou `Hugoniot`), identificador e canal de projeção quando aplicável.
- Clique normal para fixar U* continua disponível quando o modo está desligado.
- Rotina geométrica isolada em `src/math/state/projectedCurvePicking.js`, com testes de segmentos degenerados, sobreposição e seleção distante.

## Limitações
- A proximidade é medida em coordenadas SVG, **não prova coincidência matemática**. Duas curvas próximas podem ser distintas; duas curvas sobrepostas podem ter parametrizações diferentes.
- A seleção contempla as rarefações projetadas e Hugoniot exibidas neste gráfico; ainda não identifica ponto a ponto suas pré-imagens em 3D.
- Não se afirma que duas curvas próximas representam necessariamente `π₋(γ)` e `π₊(γ)` da mesma curva 3D.
- O destaque usa uma cor temporária de inspeção; a futura gramática de estilos será consolidada após auditoria semântica.

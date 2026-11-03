# Fase 14.45 — Auditoria das faces de Hopf

## Base e objetivo

Esta atualização parte da fase 14.44 (construção por segmentos da reta de traço nulo), preservando sua continuidade de parametrização. O usuário também enviou a fase 14.43, que foi considerada como referência histórica, não como base de substituição.

## Definições

Para `side = minus` ou `plus`, seja `M = DF(U_side)-sI`. A superfície de Hopf é a porção de `tr(M)=0` e `det(M)>0`. A curva de Bogdanov–Takens está na fronteira `tr(M)=det(M)=0`. A malha representa uma aproximação linear por triângulos.

## Problema diagnosticado

O algoritmo anterior verificava o traço nos vértices, mas não verificava a validade das faces interpoladas entre cortes consecutivos de `zc`. Uma face pode se afastar da superfície implícita e criar uma cortina plana artificial. Isto é uma possibilidade identificada no código, não prova de que todos os planos vistos na captura sejam Hopf; outros objetos 3D também estavam habilitados.

## Alterações

- `src/geometry/hopf/surface.js`: antes do recorte, cada triângulo é validado em três pontos médios de arestas e no baricentro usando `hopfAt`. Faces com avaliação não regular ou resíduo de traço maior que `0.015 * max(1, amplitudeTau, amplitudeY)` são descartadas.
- `src/components/Scene.jsx`: opacidade das duas folhas de Hopf reduzida de 0.34 para 0.26.
- `tests/hopfGeometry.test.js`: teste de resíduos no interior das faces emitidas.

## Limitações

O limite de resíduo é uma tolerância de discretização dependente da janela, não uma prova de convergência nem um controle de erro relativo. O descarte pode gerar pequenas lacunas em regiões de forte curvatura; o refinamento adaptativo deve ser considerado numa etapa posterior. O recorte `det >= 0` ainda interpola linearmente o determinante nas arestas e, portanto, a borda BT é aproximada. Coordenadas físicas muito grandes perto de bordas projetivas devem ser auditadas separadamente, sem limitar estados matematicamente válidos apenas por magnitude.

## Validação

Execute `npm run check` no ambiente com dependências instaladas. O teste geométrico isolado pode ser executado com `node --test tests/hopfGeometry.test.js`.

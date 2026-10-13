# Auditoria do núcleo geométrico — 16.83

## Escopo

Versão examinada: ZIP recebido em 2026-10-12. Testes executados com `node --test tests/geometryKernelCrossAudit.test.js` e um subconjunto dos testes existentes. A instalação de dependências e a inspeção visual não foram executadas.

## Identidades verificadas por amostragem

1. `waveState` satisfaz Rankine–Hugoniot e a equação característica para fibras regulares, em três famílias de parâmetros.
2. O quadrado da diferença orientada entre os autovalores da característica é o discriminante `D(U)`.
3. O determinante `det(DF(U_±)-sI)` coincide numericamente com `sonicFullImplicit` (`Y Φ_±/4`).
4. As equações `K=0` e `K=detM=0` coincidem com os resíduos usados respectivamente para J e para a base de DS.

Essas verificações são locais, em aritmética de ponto flutuante; não constituem demonstração de completude de malhas ou curvas.

## Riscos e pendências

- `src/geometry/sharedProjectedLoci.js` extrai E de `characteristicMesh(...).boundary`, isto é, de interseções de uma malha discretizada com `gap=0`; não constrói diretamente todas as componentes de `D=0`. Curvas isoladas, componentes inteiramente degeneradas e regiões bidimensionais de coincidência exigem tratamento separado.
- `characteristicMesh` armazena áreas de coincidência em `diagnostics.coincidenceArea`, mas as células totalmente coincidentes não fornecem uma representação equivalente por segmentos de fronteira. Não confundir a fronteira amostrada com o conjunto completo E.
- `sharedProjectedLoci` projeta somente sequências com pelo menos dois pontos e interrompe a linha em cartas não regulares. Pontos isolados de coincidência não aparecem como curvas projetadas.
- A identidade `det(DF(U_±)-sI)=Y Φ_±/4` inclui o fator característico `Y`. A malha das folhas sônicas não triviais utiliza `Φ_±=0`; portanto, a documentação deve distinguir o conjunto completo do determinante zero da folha sônica não trivial, sobretudo em `Y=0`.
- A geometria de J e DS foi confrontada com seus resíduos algébricos, mas ainda não foi submetida a uma auditoria quantitativa de todos os vértices renderizados e suas conexões.

## Próximas verificações

1. Auditar resíduos e continuidade de todos os vértices e arestas das geometrias de J, DS e sônicas, inclusive nas cartas recíprocas.
2. Testar degenerações `D≡0`, retas duplas e pontos isolados em relação ao levantamento para E.
3. Verificar visualmente e em compilação completa após instalar dependências do projeto.

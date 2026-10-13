# Rastreabilidade matemática ↔ código — v0.7.0

Base: `0.7.0-dev.24.47.58`. Documento matemático: `docs/MATHEMATICS_CANONICAL.tex`.

| Construção | Implementação principal | Evidência de teste | Estado |
|---|---|---|---|
| Fluxo quadrático e jacobiano | `src/math/flux/quadraticFlux.js` | `tests/math.test.js` (núcleo puro e compatibilidade) | Implementado; teste de diferenciação específico recomendado |
| Coeficientes P,Q,R e seção ortogonal | `src/math/charts/zChart.js` | `tests/math.test.js` (fibra, RH, autovetor) | Implementado |
| Estados U±, velocidade s, Rankine–Hugoniot | `src/math/manifold/waveState.js` | `tests/math.test.js`: `Rankine-Hugoniot residual vanishes in the z chart`, `r=(z,1) is a characteristic eigenvector` | Testado em amostras |
| Coordenada τ como coeficiente de (-Q,P) | `src/math/charts/zChart.js` | `tests/math.test.js` (comparação das cartas); `tests/canonicalMath.test.js` | Definição verificada; não é o t do app antigo |
| Carta recíproca Z=1/z, η=τ/Z² | `src/math/charts/reciprocalChart.js` | `tests/math.test.js` (estado físico entre cartas); `tests/canonicalMath.test.js` | Testado em amostras regulares |
| Compactificação visual zc | `src/math/charts/zChart.js` | `tests/math.test.js` (transformações) | Implementado |
| Característica C=Y=0 | `src/math/manifold/waveState.js` | `tests/math.test.js` (determinante sônico trivial em Y=0) | Implementado na parametrização característica |
| Coincidência E | `src/math/characteristic/coincidence.js` | `tests/math.test.js`: `coincidence locus E lies in characteristic surface C...` | Implementado |
| Sônicas S±, fatores Φ± | `src/math/sonic/sonic.js` | `tests/math.test.js`: `implicit sonic factors agree...`; `tests/canonicalMath.test.js` | Testado |
| Campo de rarefação finito | `src/math/rarefaction/field.js` | `tests/math.test.js` (resíduo direcional); `tests/canonicalMath.test.js` | Testado em amostras |
| Campo de rarefação recíproco | `src/math/rarefaction/field.js` | `tests/math.test.js` (carta complementar) | Implementado; falta certificação da reparametrização temporal |

## Limites

- Testes numéricos amostrais não constituem prova de regularidade ou de completude global da variedade.
- A identidade matemática da carta recíproca é verificada no domínio regular. O código `fiberZ` não representa sozinho toda a variedade W em coordenadas recíprocas.
- A tag Git `v0.6.0` não está contida no ZIP; sua preservação só pode ser conferida no repositório Git original.
- Este pacote não declara concluídas as etapas 4–8 do roadmap.

## Certificação adicional — matriz de identidades (08/10/2026)

Os testes abaixo estão em `tests/canonicalCertification.test.js`. Cada identidade é avaliada em três conjuntos de coeficientes: preset histórico, caso `a20=1.9` com perturbações e fluxo quadrático geral com todos os dez coeficientes não triviais. Os testes amostrais não demonstram propriedades globais.

| Identidade matemática | Função testada | Teste de certificação | Escopo e ressalva |
|---|---|---|---|
| `DF = D F`, derivada exata do fluxo | `flux`, `jacobian` em `src/math/flux/quadraticFlux.js` | `canonical: flux Jacobian and midpoint identity` | Diferenças centrais em três estados; tolerância relativa |
| `F(U+) - F(U-) = DF(Ubar)(U+-U-)` | `flux`, `jacobian` | Mesmo teste | Identidade quadrática em incrementos amostrais |
| `P ubar + Q vbar + R=0`, `ubar=U0+tau(-Q,P)` | `fiber`, `zChartCoefficients` | `canonical: chart constraint, projective overlap and RH` | Carta finita regular `D>0`; não certifica pontos degenerados |
| `Z=1/z`, `eta=tau/Z²` e `P_Z=Z²P(1/Z)` (idem Q,R) | `fiberZ`, `ZChartCoefficients` | Mesmo teste | Sobreposição `z != 0`; estado médio `Ubar` |
| `U+-U-=Y(z,1)` e RH; autovetor | `waveState`, `rhResidual`, `eigenResidual` | Mesmo teste | Amostras regulares; `Y=0` incluído |
| `M_r = D(DF)[(z,1)]` | `directionalJacobian` | `canonical: directional Jacobian and both sonic determinant factors` | Diferenças centrais |
| `det(DF(U±)-sI)=Y Phi±/4` | `sonicImplicit`, `sonicDeterminant`, `sonicData` | Mesmo teste | Ambas as folhas e componente trivial `Y=0` |
| `D Ubar(dot tau,dot z)` paralelo a `(z,1)` | `rarefactionField` | `canonical: finite and reciprocal rarefaction tangent directions` | Tangência, não admissibilidade física |
| `D Ubar(dot eta,dot Z)` paralelo a `(1,Z)` | `rarefactionFieldZ` | Mesmo teste | Tangência recíproca; fator temporal certificado separadamente |

### Pendências formais, não ocultadas pelos testes

1. **Concluído na sobreposição regular:** fator `-z` da transformação dos campos; teste `tests/rarefactionChartTime.test.js`. Permanecem excluídas desta certificação as fibras degeneradas e a fronteira `Z=0`.
2. Certificar o locus de coincidência `E` por identidade discriminante e análise de raízes, incluindo multiplicidades e degenerescências.
3. Especificar separadamente o tratamento das fibras degeneradas `P=Q=0`, o limite projetivo `Z=0` e a cobertura completa de `W` (a carta finita não cobre toda a componente trivial de RH).
4. Distinguir testes de identidade algébrica, testes numéricos amostrais, auditorias topológicas e validação de renderização; não tratá-los como provas equivalentes.
5. Conferir a preservação da tag `v0.6.0` no repositório Git original (não verificável em ZIP sem `.git`).


## Reparametrização temporal entre cartas (08/10/2026)

Na sobreposição regular `z != 0`, `Psi(tau,z)=(tau*z*z,1/z)` e `D Psi · V_z = -z V_Z`. Implementações: `src/math/rarefaction/field.js`, `src/math/charts/zChart.js`, `src/math/charts/reciprocalChart.js`. Teste direto de ambas as componentes: `tests/rarefactionChartTime.test.js` (três conjuntos de coeficientes, valores positivos e negativos de `z`). O fator altera orientação temporal para `z>0`; não há extrapolação do teste para `Z=0`.

## Certificação adicional: degenerescências, coincidência e cobertura projetiva

Arquivo: `tests/projectiveDegeneracy.test.js`.

- `fiber` e `fiberZ`: distinguem `absent` (`P=Q=0`, `R≠0`) e `degenerate` (`P=Q=R=0`). Nesse último caso, o parâmetro `tau`/`eta` não parametriza todos os estados médios.
- `ZChartCoefficients`: a homogeneização é identidade polinomial; em `Z=0`, os coeficientes são `(2b20,b11,b10)`. A carta recíproca inclui a direção projetiva somente quando a fibra é regular, e o código não implementa todos os estados completos nessa carta.
- `coincidenceTauRoots`: cada raiz retornada é confrontada com `discriminant(fiber(z,tau).Ubar)`, incluindo exemplo de raiz dupla. O teste não certifica a enumeração global de componentes nem multiplicidades de raízes em todas as degenerescências.
- `waveState`: a componente trivial `U-=U+` satisfaz RH para qualquer `s`; o modelo da característica escolhe apenas o autovalor associado à direção. Portanto, não há cobertura integral de `W`.

**Estado:** certificação algébrica e testes amostrais concluídos nos casos acima; regularidade global, completude da cobertura e continuação de ramos permanecem abertas. A tag Git `v0.6.0` não é alterada por este pacote.

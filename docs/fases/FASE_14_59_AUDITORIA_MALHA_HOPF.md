# Fase 14.59 — Auditoria de conectividade da malha de Hopf

## Objetivo

Medir descontinuidades e possíveis artefatos da malha de Hopf sem alterar a geometria exibida e sem conectar artificialmente ramos distintos.

## Implementação

- `src/geometry/hopf/meshAudit.js`: conta faces inválidas ou degeneradas, faces que cruzam o limiar entre as cartas, sondas inválidas, determinantes negativos nas sondas, maior resíduo de traço, arestas de fronteira, arestas não manifold e componentes conectadas da malha discretizada.
- `scripts/audit-hopf-mesh.js`: executa a auditoria nas duas folhas para a janela tau [-1,1], Y [-6,6], com os coeficientes padrão do laboratório.
- `tests/hopfMeshAudit.test.js`: testa os dois lados e a detecção de componentes desconectadas.

Execute `npm run audit:hopf:mesh`.

## Resultado observado

| Medida | Hopf- | Hopf+ |
| --- | ---: | ---: |
| Faces | 634 | 628 |
| Componentes | 6 | 7 |
| Arestas de fronteira | 272 | 268 |
| Arestas não manifold | 0 | 0 |
| Faces degeneradas | 0 | 0 |
| Faces que atravessam o limiar de carta | 0 | 0 |
| Resíduo máximo de traço no centro | 0.02948043 | 0.02960287 |

As componentes são componentes da *malha triangular*, não necessariamente componentes topológicas da superfície matemática. Arestas de fronteira podem corresponder à janela visível, a det=0 ou a faces rejeitadas. A ausência de faces atravessando o limiar de carta não prova continuidade na transição: pode indicar simplesmente ausência de geometria válida naquela região.

## Limitações

Esta fase é diagnóstica e não modifica a cena. A quantização de vértices para contagem de arestas utiliza tolerância 1e-7 nas coordenadas da malha; sua adequação deve ser revista para escalas muito diferentes. A sondagem de traço no centro não substitui uma estimativa certificada do erro geométrico de cada face. Não se conclui que as superfícies sejam globalmente desconectadas nem que atinjam o infinito projetivo.

## Verificação

`npm test`: 616 testes aprovados. Lint e build não executados neste ambiente.

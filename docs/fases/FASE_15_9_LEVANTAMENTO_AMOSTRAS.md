# Fase 15.9 — Levantamento de amostras para a Variedade 3D

## Implementação

- `src/math/state/hugoniotWaveLift.js` reconstrói `(tau,Y,z)` de extremos ordenados `(U_-,U_+)` de um salto.
- `z=(u_+-u_-)/(v_+-v_-)` e `Y=v_+-v_-`, conforme a carta finita existente `r=(z,1)`.
- `tau` é recuperado projetando o estado médio sobre a seção afim da fibra definida por `fiber(z,0,p)`.
- Reconstrói `waveState(tau,Y,z,p)` e compara ambas as projeções e o resíduo RH; somente `kind='regular'` permite navegação.
- Casos de salto nulo, carta indisponível, fibra degenerada ou resíduo incompatível não criam ponto 3D.
- Em `StateSpaceDialog.jsx`, amostras verificadas mostram coordenadas, erros e botão **Inspecionar amostra na Variedade 3D**.
- Em `App.jsx`, o botão seleciona o ponto `(tau,Y,zc)` e abre a cena 3D, sem modificar os estados de Riemann.

## Limitações

- O levantamento é restrito à carta finita `z` e às amostras de Hugoniot com extremos ordenados. Não é uma continuação numérica de curva inteira.
- `regular` indica compatibilidade algébrica na tolerância numérica adotada, não prova admissibilidade entrópica nem unicidade de soluções.
- Amostras de rarefação e saltos horizontais precisam de tratamento em outras cartas.
- Inspecionar o ponto na cena não força reenquadramento da câmera.

## Verificação

- `npm test`: 666 testes aprovados neste ambiente.
- `npm run check` e verificação visual precisam ser executados com dependências instaladas.

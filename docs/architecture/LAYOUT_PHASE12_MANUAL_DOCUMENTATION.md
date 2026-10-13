# Layout — etapa 12: Manual e Documentação

## Escopo

- Manual do usuário: instruções operacionais para os quatro ambientes centrais, painéis responsivos, estados de Riemann, seleção de candidatos e leitura de diagnósticos.
- Documentação matemática: atualização das seções 12–15 para refletir as saturadas/compostas numéricas, as cadeias candidatas de Riemann, os perfis físicos e os limites dos diagnósticos.
- Mantidas as definições canônicas de `\mathcal C` (característica) e `\mathcal E` (coincidência).

## Restrições científicas

As cadeias calculadas permanecem candidatos numéricos. Rankine–Hugoniot, Lax, Liu amostrado, transversalidade e convergência não são apresentados como prova global de admissibilidade entrópica. Resultados inconclusivos não são tratados como zeros.

## Validação

`npm test`: 532 testes aprovados, zero falhas. `npm run check` requer as dependências de desenvolvimento instaladas no ambiente de destino.

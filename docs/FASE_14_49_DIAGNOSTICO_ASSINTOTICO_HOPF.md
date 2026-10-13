# Fase 14.49 — Diagnóstico assintótico das superfícies de Hopf

## Objetivo

Verificar se a aparente interrupção das superfícies de Hopf perto de `zc = ±1` é compatível com as condições matemáticas e com a janela de amostragem. Esta fase **não** altera a geometria 3D, a câmera, a transparência ou as configurações existentes.

## Equações

Para cada estado `U_±`, escrevemos `M_± = DF(U_±) - s I`. A folha de traço zero satisfaz `tr M_± = 0`; a região de Hopf exige adicionalmente `det M_± > 0`. A cada `zc` fixo, no fluxo quadrático, o traço é afim em `(tau,Y)`:

`a(zc) tau + b(zc) Y + c(zc) = 0`.

O diagnóstico recorta essa reta no retângulo `tau ∈ [-1,1]`, `Y ∈ [-6,6]`, e amostra o determinante no segmento restante. As duas extremidades da coordenada visual são aproximadas por sequências `zc = ±(1-ε)`; `zc = ±1` não é avaliado diretamente.

## Interpretação rigorosa

- `outside-window`: a reta de traço zero não cruza a janela; isso **não** demonstra que a superfície de Hopf termina matematicamente.
- `positiveSamples > 0`: após um limiar numérico relativo à escala do determinante, existe pelo menos um ponto de Hopf certificado numericamente naquela fatia, desde que o cálculo permaneça regular.
- `positiveSamples = 0`: nenhuma amostra teve determinante significativamente positivo; isso **não** prova ausência entre as amostras.
- `invalid-chart`, `numerical-failure` ou `trace-identically-zero`: requerem investigação própria, não devem ser interpretados como fronteira geométrica.

A aproximação `zc → ±1` com `tau` limitado **não** representa automaticamente uma carta regular no infinito: a seção `Ubar(tau,z)` depende da escolha de parametrização e pode divergir. Uma análise global exige coordenadas recíprocas adequadas e controle dos estados físicos.

## Arquivos

- `src/math/sonic/hopfAsymptotic.js`: cálculo independente da malha.
- `scripts/audit-hopf-ends.js`: relatório reproduzível para os coeficientes padrão.
- `tests/hopfAsymptotic.test.js`: testes da reta de traço zero, do recorte e da cobertura dos dois extremos.

## Execução

```bash
node scripts/audit-hopf-ends.js
npm run check
```

## Próxima etapa

Confrontar o relatório com as imagens do isolamento de Hopf e, caso haja pontos positivos até o extremo, verificar se a triangulação os representa. Não prolongar a malha sem verificar a condição de Hopf.

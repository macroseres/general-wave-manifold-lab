# Fase 14.19 — verificação da projeção da coincidência

Teste automatizado `tests/coincidenceProjection.test.js`.

A construção de `coincidenceTauRoots` reutiliza a diferença espectral assinada `gap` de `characteristicSpectrum`. Para cada raiz regular amostrada, o teste verifica que `gap ≈ 0`, que o discriminante de `DF(Ubar)` é nulo após projetar a coincidência no espaço de estados, e que o sinal de `gap` muda ao atravessar uma raiz simples. Confere ainda `Y=0` nos pontos emitidos por `coincidencePoints`.

O teste inclui os coeficientes padrão e um fluxo quadrático geral. A validação é local à carta finita e aos pontos regulares amostrados: não prova cobertura global do locus, nem trata componentes degeneradas ou singularidades de carta.

Não são feitos cálculos adicionais na renderização; o teste reutiliza as funções matemáticas existentes. Execute `node --test tests/coincidenceProjection.test.js`.

# Fase 14.94 — continuação implícita experimental de BT⁻

A curva BT⁻ é definida simultaneamente por `sonicImplicit=0` e `trace(DF(U_-)-sI)=0`.
O novo construtor `src/geometry/sonic/continueBtCurve.js` usa a malha apenas para obter sementes.
Depois integra a interseção das duas superfícies implícitas por preditor-corretor de
pseudo-comprimento de arco. A direção tangente é proporcional ao produto vetorial
dos gradientes das duas equações; o corretor resolve três equações em três incógnitas.
Há limitação adaptativa do passo, verificação de resíduos e rejeição de saltos de ramo.
BT⁺ continua sendo obtida por †, sem novo cálculo matemático.

O controle **Construção de BT (comparação)** permite alternar entre **Original**
(padrão) e **Continuação implícita (experimental)**, sem alterar Hopf ou sônicas.

## Limitação conhecida

Em regiões em que os gradientes perdem independência ou a curvatura aumenta
muito, a continuação pode parar antes de alcançar o bordo da janela. Por isso,
o método experimental NÃO substitui automaticamente o original. É necessário
avaliar completude e topologia da curva antes de promovê-lo a padrão.

## Verificação

`node --test tests/continueBtCurve.test.js` verifica resíduos e rejeição de
mudanças bruscas para a configuração do estudo (a20=-4.5, b02=-0.1 etc.).
`npm run check` executa a suíte completa, lint e build quando as dependências
estão instaladas.

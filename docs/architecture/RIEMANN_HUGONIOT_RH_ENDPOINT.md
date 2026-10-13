# Refinamento RH do extremo da curva de Hugoniot

O trecho destacado de Hugoniot é identificado pelos metadados do ramo e do segmento da construção da cadeia. Quando os coeficientes do fluxo quadrático estão disponíveis, a extremidade é procurada **dentro do segmento selecionado** pela condição escalar

\[
\det(U-U_{fixo},F(U)-F(U_{fixo}))=0.
\]

Para saltos não nulos, essa condição é equivalente à existência de uma velocidade de choque que satisfaça Rankine–Hugoniot. A velocidade é calculada por projeção do salto do fluxo na direção do salto de estado, e o resíduo vetorial relativo é verificado separadamente.

O algoritmo amostra o segmento, localiza mudanças de sinal e aplica bisseção; aceita apenas raízes próximas de `U_M`, com resíduo relativo RH menor que `1e-8`. Não procura raízes tangenciais sem mudança de sinal, não abandona o segmento de proveniência e não certifica admissibilidade entrópica. A curva entre os vértices continua sendo uma poligonal amostrada.

O modo geométrico legado permanece disponível para chamadas que não forneçam coeficientes de fluxo; na interface principal o fluxo é passado explicitamente e o destaque só ocorre quando a correção RH é aceita.

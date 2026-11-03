# Fase 15.7 — proveniência de curvas projetadas

- Ao selecionar uma curva de Hugoniot amostrada no espaço de estados, o painel mostra sua projeção canônica e a fibra que a origina.
- Em π₊, o traçado variável é π₊(ℋᶠᵒʳʷ(U*)), com π₋ fixada em U*.
- Em π₋, o traçado variável é π₋(ℋᵇᵃᶜᵏ(U*)), com π₊ fixada em U*.
- Um comando abre a cena 3D com as duas fibras já implementadas; **não** afirma correspondência ponto a ponto entre os segmentos desenhados.
- Para rarefações no plano, informa explicitamente que não há levantamento 3D certificado.
- A identificação continua baseada no conjunto de curvas amostradas, com seleção por proximidade em pixels.
- Não foram alteradas rotinas matemáticas, parâmetros, malhas ou câmeras.

## Verificação manual
1. Fixar U* e escolher π₊; ativar inspeção e selecionar Hugoniot.
2. Conferir a descrição forward e abrir a variedade 3D.
3. Repetir em π₋, conferindo backward.
4. Selecionar rarefação: não deve oferecer levantamento 3D fictício.
5. Conferir sobreposição e alternância de curvas.

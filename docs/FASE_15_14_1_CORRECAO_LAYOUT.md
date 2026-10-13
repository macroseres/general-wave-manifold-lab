# Fase 15.14.1 — Correção de layout do Espaço de estados

O CSS anterior posicionava somente o painel de ferramentas e o gráfico nas colunas do grid, deixando o inspetor de curvas como item automático na coluna estreita de 34px. Isso quebrava o texto e criava um gráfico desproporcional.

Agora os controles ocupam linhas de largura total: ferramentas recolhíveis, inspetor de curvas, comparação de projeções (quando existente) e gráfico. Nenhuma equação ou curva foi alterada.

Verificar desktop/mobile, painel aberto/fechado, comparação de projeções e `npm run check`.

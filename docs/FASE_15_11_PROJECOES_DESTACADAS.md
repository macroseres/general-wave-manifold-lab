# Fase 15.11 — retorno visual das projeções de um ponto 3D

- O comando de inspeção `π₋(P)` ou `π₊(P)` transfere **as coordenadas do estado projetado** do ponto atualmente inspecionado para o Espaço de estados.
- Um marcador ciano de dois círculos identifica a projeção pedida, sem alterar `U*`, `U_L`, `U_R` ou as curvas.
- Mostra as coordenadas com sete algarismos significativos.
- Se o ponto estiver fora da janela, mostra um comando explícito **Incluir na janela**; não muda a janela silenciosamente.
- A seleção da projeção é independente da seleção de curvas coincidentes.
- Não pressupõe que a inversa da projeção seja unívoca.
- Ainda não destaca simultaneamente as duas projeções: apenas a solicitada; a outra pode ser acessada pelo comando correspondente na inspeção 3D.
- Verificar no navegador a posição do marcador e sua legibilidade nos temas claro e escuro.

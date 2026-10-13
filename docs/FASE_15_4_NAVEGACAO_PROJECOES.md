# Fase 15.4 — Navegação 3D → espaço de estados

## Funcionalidade
- No painel de inspeção do ponto regular `P`, botões explícitos **Ver π₋(P) no plano** e **Ver π₊(P) no plano**.
- Abrem o Espaço de estados com a projeção solicitada selecionada; usam o estado matemático atual já calculado no aplicativo.
- O objeto inspecionado continua sendo `P`; os botões **não** afirmam que um estado no plano determina um único ponto 3D.
- A mudança manual da projeção dentro do Espaço de estados continua disponível.
- `projectionRequest` inclui identificador de solicitação para repetir uma escolha mesmo após mudança manual da projeção.
- Não altera fórmulas, amostragem, malhas, algoritmos, estados de Riemann ou seleção de fibras.

## Ainda pendente
- Seleção de curvas coincidentes na projeção e inspeção de correspondências ponto a ponto.
- Navegação 2D → 3D que destaque toda a fibra correta (não um ponto arbitrário).
- Verificação visual de foco, contraste e responsividade.

# Fase 15.5 — Navegação do estado fixado para as fibras 3D

## Entregue
- Em Espaço de estados, botão **Ver fibras de U* em 3D** junto a **Fixar U***.
- Desabilitado até existir `fixedState` válido; preserva a seleção existente.
- Ao ativar, abre a Variedade 3D e liga ambas as visibilidades de fibras canônicas.
- Reutiliza `StateFibres` e `stateFibreGeometry` já existentes; nenhuma nova fórmula de projeção ou ponto arbitrário é introduzido.
- Não altera os estados de Riemann `U_L` e `U_R`, a câmera, os limites do domínio nem os algoritmos geométricos.

## Limitações
- A navegação ainda não ajusta a câmera automaticamente: o comando de ajuste 3D existente pode ser usado manualmente.
- Ainda não existe picking de arcos coincidentes ou destaque ponto a ponto em ambas as projeções.
- Validar visualmente no navegador a abertura e a visibilidade de ambas as fibras.

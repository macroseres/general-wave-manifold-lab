# Fase 14.9.3 — dimensionamento dos gráficos físicos

## Causa
A regra `.inlineWorkspaceDialog:has(#physical-title) .physicalLayoutBody svg { height:auto }` tinha especificidade superior à regra de altura da fase 14.9.2. Por isso, o SVG do diagrama (x,t) crescia proporcionalmente à largura disponível e empurrava os perfis para fora da janela.

## Correção
As regras específicas do diagrama e dos perfis agora prevalecem sobre a regra genérica. As dimensões do SVG são controladas pelo CSS, sem modificar `viewBox`, coordenadas, curvas, velocidades ou os cálculos. `object-fit:contain` preserva a proporção dos eixos.

## Verificação manual
- Verificar diagrama e perfis na mesma tela com janela desktop.
- Alternar painel esquerdo aberto/fechado.
- Verificar layout em janela estreita.
- Verificar candidato selecionado e órbita de rarefação sem candidato.
- Confirmar que diagnósticos permanecem abaixo dos gráficos.

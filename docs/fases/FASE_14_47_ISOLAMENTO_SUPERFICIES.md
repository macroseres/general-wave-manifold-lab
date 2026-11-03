# Fase 14.47 — Isolamento de superfícies

## Objetivo

Identificar qual família de superfícies origina regiões planas e sobreposições na visualização tridimensional, sem alterar os cálculos ou a câmera.

## Operação

No topo do gráfico, **Isolar** oferece: **Todas**, **𝓒 (característica)**, **𝓢⁻**, **𝓢⁺**, **Hopf⁻** e **Hopf⁺**. A seleção é independente dos controles existentes no painel lateral: uma família só aparece se também estiver habilitada ali. **Todas** recupera a composição anterior, respeitando as escolhas laterais.

O controle não remonta o Canvas, não altera parâmetros, limites, escala, posição da câmera, curvas de rarefação, separatrizes, fibras de estado, inflexão ou dupla sônica. As curvas BT vinculadas às respectivas sônicas acompanham a família isolada.

## Implementação

- `src/components/Scene.jsx`: estado local `surfaceIsolation` e filtros independentes para característica, sônicas e Hopf.
- `src/styles/scientific-ui.css`: seletor compacto compatível com temas claro e escuro.
- `tests/surfaceIsolation.test.js`: verificações estáticas de opções, persistência do Canvas e filtros.

## Limitações

O isolamento é diagnóstico visual: não certifica a validade matemática das superfícies. A visibilidade de outras curvas e planos auxiliares permanece independente. Não há persistência da seleção após recarregar a página; o padrão é **Todas**.

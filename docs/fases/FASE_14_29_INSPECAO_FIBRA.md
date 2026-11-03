# Fase 14.29 — Inspeção de fibra projetiva

Na Variedade 3D, o botão **Fibra projetiva** abre um painel de diagnóstico para a direção do ponto selecionado. A opção **Inspecionar direção infinita (Z=0)** avalia a carta recíproca sem substituir infinito por z grande.

O painel reutiliza `exceptionalFiberLimit`, `exceptionalFiberNeighborhood` e `characteristicProjectiveFiber`, incluindo ordem de anulação e reta limite quando existem. Não desenha geometria artificial. O resultado é local e depende da tolerância dos módulos matemáticos existentes.

Validação: `npm run check` e clique na superfície característica para alterar a direção inspecionada.

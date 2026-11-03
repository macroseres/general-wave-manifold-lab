# Fase 15.25 — Controles de visibilidade

- Espaço de estados: substituído o switch de hiperbolicidade por botão de olho, com estados Visível/Oculto, aria-pressed e rótulos acessíveis.
- Variedade 3D: checkboxes das camadas `toggle` e `characteristicToggle` recebem aparência de botões de olho por CSS; preservam handlers, estado e acessibilidade nativos.
- Verde discreto indica visível; cinza indica oculto.
- Nenhum cálculo ou valor inicial foi modificado.
- Validação: executar `npm run check` e inspecionar ambos os temas no navegador.

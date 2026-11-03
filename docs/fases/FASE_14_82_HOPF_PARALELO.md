# Fase 14.82 — Hopf em workers paralelos

- Divide a construção independente das folhas Hopf menos e mais entre dois Web Workers quando ambas estão visíveis.
- Preserva as implementações de malha, recorte espectral, coordenadas e parâmetros existentes.
- Reúne os resultados somente depois que ambos os workers retornam; cancela workers obsoletos na mudança de parâmetros.
- Quando somente um lado é visível, cria apenas um worker.
- Mantém a instrumentação `[geometria] Hopf` para comparação de desempenho no navegador.
- Os avisos `THREE.Clock`, GPOS/GSUB e eventos Firefox são originados em dependências; não foram silenciados nem modificados por patches em node_modules. Uma atualização das bibliotecas exige teste de integração visual separado.

Validação: `node --test tests/*.test.js` (645 aprovados). `npm run lint` e `npm run build` requerem dependências instaladas.

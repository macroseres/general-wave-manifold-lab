# Fase 14.81 — Compatibilidade do console

- KaTeX agora produz HTML visual sem MathML nativo, evitando o aviso do Firefox sobre `mathvariant="script"`.
- Os elementos recebem `role="math"` e `aria-label` com o TeX original para conservar uma alternativa textual acessível. **Limitação:** a alternativa textual não equivale à navegação estrutural de MathML por leitores de tela.
- Os avisos `THREE.Clock`, `unsupported GPOS/GSUB` e `MouseEvent.mozPressure/mozInputSource` são emitidos por bibliotecas e não foram silenciados nem alterados nesta fase. Devem ser acompanhados em futuras atualizações compatíveis de dependências.
- Favicon da fase 14.80 preservado.
- Não há alterações nas equações, malhas, curvas ou Web Worker de Hopf.

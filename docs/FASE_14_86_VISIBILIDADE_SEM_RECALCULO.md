# Fase 14.86 — visibilidade sem recálculo de Hopf

- Hopf- e Hopf+ são calculadas juntas, uma vez por chave geométrica (coeficientes do fluxo, domínio de amostragem e modo traceOnly).
- O componente permanece montado quando as duas superfícies estão ocultas.
- As caixas de seleção controlam apenas `group.visible` do Three.js, sem reconstruir BufferGeometry ou solicitar Workers.
- Resultados assíncronos de configurações antigas são ignorados.
- A construção de Hopf e seu recorte espectral não foram alterados.
- Objetos que dependem de estados iniciais, como fibras de Hugoniot e curvas selecionadas, conservam suas dependências próprias.
- Mudanças da janela de amostragem podem exigir nova malha, embora não alterem o objeto matemático abstrato.

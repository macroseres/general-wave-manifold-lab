# Fase 14.24 — Auditoria de cartas e fibras excepcionais

Foi acrescentado `src/math/characteristic/chartAudit.js`, que compara a representação do mesmo estado médio nas cartas finita e recíproca, sem recomputar espectros ou triangulações.

Na sobreposição `Z=1/z`, a mudança correta de parâmetro é `eta=tau/Z²`; portanto `fiber(z,tau,p).Ubar` deve coincidir com `fiberZ(Z,eta,p).Ubar`.

As fibras `P=Q=0, R≠0` são **ausentes**; as fibras `P=Q=R=0` são **degeneradas** (a equação de fibra impõe `0=0`). Uma fibra degenerada não pode ser representada arbitrariamente por uma reta `tau` nem corrigida trocando apenas a carta. Ambas as cartas são verificadas para detectar desacordos numéricos.

Esta etapa implementa **diagnóstico e testes**, não uma reconstrução geométrica global de fibras degeneradas. Não altera a renderização da fase 14.23. Próxima etapa: decidir a representação geométrica adequada dessas fibras, em especial quando há componente bidimensional de coincidência.

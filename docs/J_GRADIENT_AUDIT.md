# Auditoria local de J — gradiente e projeção

Execute `npm run audit:j:gradient`. O comando é isolado da interface e não participa da renderização.

Para cada amostra, calcula `|K|`, norma do gradiente em `(tau,zc)` por diferenças centrais, resíduo normalizado e projeção local iterativa para `K=0` por passos de Newton com busca linear.

A distância de projeção é local e não prova ser a menor distância global. A razão `|K|/||grad K||` é uma aproximação de primeira ordem, não uma distância exata. Os extremos próximos de `|zc|=1` exigem cuidado por causa da transformação tangente.

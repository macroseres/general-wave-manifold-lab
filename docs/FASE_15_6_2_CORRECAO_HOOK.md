# Fase 15.6.2 — Dependência de useMemo

- `view` agora é memoizado com dependências `[g,window]`.
- `inspectableCurves` depende do objeto `view` estável, evitando o alerta de dependência ausente e recomputações em renders não relacionados.
- Nenhuma mudança na geometria ou na seleção.

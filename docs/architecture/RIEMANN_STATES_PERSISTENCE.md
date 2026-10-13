# Estados iniciais do problema de Riemann

O painel de estados permite posicionar independentemente `U_L` e `U_R` por L/R, clique e hover. Ambos começam ausentes (`null`).

A partir do schema v3, `scientific.riemannStates` registra `{left:[u,v]|null,right:[u,v]|null}`. A importação valida que coordenadas sejam números finitos. Experimentos v1 e v2 são migrados, com ambos os estados ausentes, sem inventar dados iniciais.

Esta alteração apenas persiste dados iniciais; não constrói nem certifica uma solução de Riemann. A sincronização de soluções entre espaço de estados, variedade de ondas e espaço físico exige um solucionador admissível.

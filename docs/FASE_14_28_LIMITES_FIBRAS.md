# Fase 14.28 — limites de fibras excepcionais

Para uma direção projetiva excepcional x0, os polinômios P,Q,R têm ordem comum k. Se k é finita, dividir a equação característica por (x-x0)^k e passar ao limite fornece P_k u + Q_k v + R_k=0. Se (P_k,Q_k) é não nulo, a família regular converge, em estados finitos, para essa reta. Se ambos são nulos mas R_k não, não existe limite de estados finitos. Se os três polinômios são identicamente nulos, não existe uma reta limite preferencial.

O módulo `fiberLimits.js` reutiliza `exceptionalFiberNeighborhood`, sem repetir avaliações do espectro. A visualização não é modificada nesta fase. A convergência aqui é da equação algébrica de fibras, não uma prova de regularidade global da variedade ou de suas cartas.

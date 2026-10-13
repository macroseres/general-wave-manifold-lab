# Diagnóstico de transparência — dev.24.47.56

A versão anterior já usava `depthWrite={false}` no material transparente.

Modos: transparente original (DoubleSide), transparente somente frente (FrontSide), transparente somente verso (BackSide), opaco e wireframe. Todos mantêm `depthTest=true`; modos transparentes usam `depthWrite=false` e opacidade 0.42.

Teste: exibir somente S− com a20=1.9; manter câmera e escalas; alternar os três modos transparentes. Se as estrias persistirem no modo somente frente, a hipótese de sobreposição de frente/verso não basta. Isso não corrige ordenação de triângulos transparentes dentro da mesma malha.

Nenhuma alteração no Worker, cache, índices, triangulação, equações ou coordenadas.

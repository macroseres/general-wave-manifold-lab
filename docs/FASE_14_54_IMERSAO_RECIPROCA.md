# Fase 14.54 — imersão recíproca e parâmetros de referência

## Parâmetros iniciais corrigidos

- Janela: τ ∈ [-1,1], Y ∈ [-6,6].
- Escalas de visualização: τ = 1.75, Y = 0.25, ẑ = 2.55.
- Coeficientes do fluxo: permanecem os definidos em `defaultCoefficients`.

A correção é feita nos estados iniciais de `src/App.jsx`, não na função de ajuste automático da câmera, que continua sendo uma ação explícita do usuário. Um experimento importado pode substituir esses valores.

## Imersão recíproca

Foi introduzido um mapa de diagnóstico da malha da carta recíproca em R⁴:

    (free,X,Z) ↦ (ū,v̄,X,Z).

As coordenadas ū,v̄ são reconstruídas pela condição de direção característica. O mapa é válido em Z=0 e permite comparar a geometria sem usar τ como se fosse a coordenada livre recíproca. A malha conserva sua conectividade e os testes verificam o recobrimento com a carta finita.

## Limite

Não foi incorporada uma nova malha à cena 3D: uma projeção de R⁴ para (τ,Y,ẑ) que atravesse Z=0 requer escolha e validação geométrica adicionais. Desenhar (free,X,Z) diretamente como (τ,Y,ẑ) produziria uma representação incorreta.

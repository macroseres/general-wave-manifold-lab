# Regularidade da incidência característica reduzida

Para r=(x,y) unitário, define-se q(U,[r])=det(r,DF(U)r).
O diagnóstico calcula a derivada angular e as derivadas em u e v de q.

- `incidenceRegularity=regular`: o gradiente (u,v,ângulo) de q é não nulo;
  portanto q=0 é uma hipersuperfície regular **no espaço de incidência reduzido**.
- `fixedStateIntersection=transverse`: a derivada angular é não nula;
  a interseção da incidência com U fixo é transversal em RP¹.
- `non-transverse`: raiz angular múltipla ou degenerada; não implica,
  isoladamente, singularidade da hipersuperfície de incidência.

As derivadas são calculadas na representação homogênea e cobrem z=infinito
(Z=0). Os limiares são relativos a uma escala dos coeficientes.

**Limitação:** isso não certifica a regularidade da variedade de ondas W,
nem a transversalidade geométrica das fibras completas de Hugoniot. Essa
etapa exige o posto da diferencial das equações de Rankine–Hugoniot nas
cartas da variedade, incluindo a componente de coincidência.

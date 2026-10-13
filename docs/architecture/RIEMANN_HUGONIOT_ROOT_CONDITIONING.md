# Condicionamento numérico das raízes de Hugoniot

Para um segmento amostrado q(t)=a+t(b-a), 0<=t<=1, o determinante
D(t)=det(q(t)-Ufix,F(q(t))-F(Ufix)) é um polinômio de grau <=3.

O refinamento preserva a validação por resíduo relativo de Rankine–Hugoniot,
proximidade do estado intermediário e exclusão do salto trivial. Além do ponto
aceito, expõe:

- `normalizedDeterminantSlope`: |D'(t)| / max(|c0|,...,|c3|),
  com valor 0 se o polinômio é identicamente nulo;
- `nearestRootParameterDistance`: separação paramétrica para a raiz detectada
  mais próxima, ou null se não há outra raiz detectada;
- `rootCondition`: `segment-contained`, `near-tangential` ou
  `transverse-numerical`. O limiar de inclinação é heurístico.

Esses indicadores são apenas diagnósticos de condicionamento; não provam
multiplicidade algébrica, bifurcação geométrica, nem admissibilidade entrópica.
Os testes incluem raízes próximas, segmento quase tangente sem raiz e segmento
inteiramente contido no locus de Hugoniot.

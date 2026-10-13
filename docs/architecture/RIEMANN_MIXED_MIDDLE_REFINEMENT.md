# Refinamento do estado intermediário nas cadeias mistas

Para os candidatos R_s(U_L) -> H_f(U_R) e H_s(U_L) -> R_f(U_R), a interseção entre poligonais é apenas uma aproximação inicial de U_M.

O módulo `refineMixedMiddle` reintegra localmente um trecho da curva integral da família característica com RK4, usando orientação consistente com o trecho amostrado. Ao longo desse trecho, procura por bisseção uma raiz da incidência escalar

    det(U - U_fixo, F(U) - F(U_fixo)) = 0.

Uma raiz só é aceita quando o diagnóstico vetorial de Rankine–Hugoniot confirma resíduo relativo pequeno e quando a posição não se afasta excessivamente da poligonal original. A raiz não é extrapolada para fora do segmento.

O resultado fica no campo `refinement` de cada candidato. O estado `middle` do candidato continua representando a interseção amostrada; o diagnóstico `evidence` é reavaliado no ponto refinado apenas se o refinamento tiver sido aceito. A não existência de mudança de sinal, a falha da integração ou um resíduo excessivo resultam em diagnóstico explícito, não em uma raiz fictícia.

**Limitações:** a reintegração é local, com um único passo RK4 parametrizado pelo comprimento do trecho. A interseção ainda não é uma solução conjunta certificada da curva integral e da Hugoniot. Os critérios de Lax e de ordenação são necessários, mas não substituem Liu nem o perfil viscoso. Não há certificação de solução entrópica.

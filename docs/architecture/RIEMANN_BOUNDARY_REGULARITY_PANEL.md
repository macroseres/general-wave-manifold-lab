# Regularidade na fronteira característica — painel de Riemann

O diagnóstico usa a aplicação canônica de Rankine–Hugoniot `mathcal F = X(DF(ubar)-sI)r` e sua equação desingularizada `G=(DF(ubar)-sI)r`.

Para cada estado inicial existente, obtém as direções características reais e avalia `DG` em amplitude zero. Escolhe a carta `r=(1,Z)` quando a primeira componente da direção é dominante; caso contrário, escolhe a carta recíproca `r=(z,1)`. Calcula posto, regularidade do nível e dimensão local esperada da fibra forward/backward. A dimensão só é reportada quando o ponto pertence ao nível e o posto de `DG` é dois.

O diagnóstico **não** certifica tangência ou transversalidade da fibra com a característica; tampouco certifica admissibilidade de choques ou rarefações. Jacobianos escalares e regiões elípticas continuam tratados separadamente.

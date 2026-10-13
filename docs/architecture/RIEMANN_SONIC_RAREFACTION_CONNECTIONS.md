# Conexões sônicas com rarefações: diagnóstico preliminar

Para um choque a partir de U_L, o contato em S+ ocorre no estado direito U_c. Uma eventual conexão choque–rarefação precisa ligar U_c a U_R por uma curva integral da mesma família, com velocidades características ordenadas. Por isso a comparação é feita com a rarefação traçada a partir de U_R, em orientação reversa.

Para um choque que termina em U_R, o contato em S- ocorre no estado esquerdo U_c. Uma eventual conexão rarefação–choque exige uma rarefação de U_L até U_c. Por isso a comparação é feita com a curva traçada a partir de U_L.

O código exige convergência prévia da raiz de Rankine–Hugoniot + sônica, compara a distância do contato aos segmentos poligonais da rarefação oposta e verifica a compatibilidade numérica da velocidade. Não há certificação de raízes na curva integral contínua, condições entrópicas globais, compatibilidade das velocidades de todas as ondas ou construção completa do estado intermediário. A tolerância geométrica é relativa à escala das coordenadas; os resultados são candidatos exploratórios.

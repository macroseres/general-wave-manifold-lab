# Ordenação característica das conexões sônicas (etapa necessária)

Para um contato refinado em S+ (choque de U_L até U_c), compara-se U_c com uma curva integral da mesma família ancorada em U_R, armazenada do estado U_R para trás. Para um contato em S- (rarefação até U_c seguida de choque para U_R), compara-se com uma curva integral ancorada em U_L.

Além da proximidade no espaço de estados e da condição s = lambda_i(U_c), a implementação verifica a ordenação da velocidade característica em **todos os segmentos usados** até a projeção do contato: velocidades não crescentes ao afastar-se de U_R; não decrescentes ao afastar-se de U_L. Reavalia-se a velocidade no ponto projetado e registra-se seu desvio em relação à velocidade de choque.

A projeção sobre a polilinha é uma aproximação discreta, não a solução de um problema de valor de contorno na curva integral. O rótulo `ordered-geometric-candidate` expressa somente condições necessárias. Não implica condição de entropia, perfil viscoso, conexão composta global ou existência/unicidade de solução de Riemann.

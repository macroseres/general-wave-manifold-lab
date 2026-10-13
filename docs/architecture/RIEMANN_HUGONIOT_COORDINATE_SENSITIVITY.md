# Sensibilidade em coordenadas do espaço de estados

Para o segmento amostrado fixo q(t)=A+t(B-A), o acompanhamento numérico da raiz da condição de Rankine–Hugoniot fornece dt/dp. Mantendo A e B fixos, a derivada da posição corrigida é dq/dp=(B-A)dt/dp. A comparação de dois candidatos utiliza os vetores (du/dp,dv/dp), evitando comparar parâmetros t de segmentos distintos como se tivessem escala comum.

Esta é uma derivada *restrita ao segmento original*. Não é a derivada do estado intermediário de uma cadeia de Riemann completamente reconstruída após perturbação do fluxo, pois os próprios ramos e interseções podem variar. Derivadas sem acompanhamento bilateral de raízes são inconclusivas. O procedimento não avalia admissibilidade entrópica.

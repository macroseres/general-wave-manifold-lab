# Diagnóstico de Liu para as duas orientações compostas

A conexão choque–rarefação usa um contato refinado em S+ da Hugoniot forward de U_L e a verificação numérica forward de Liu. A conexão rarefação–choque usa S- da Hugoniot backward de U_R e o diagnóstico backward de Liu, cuja desigualdade amostrada é invertida em relação à forward.

A associação exige coincidência do ponto de contato refinado, família característica e lado sônico. Contatos ambíguos, arcos ausentes e pré-requisitos geométricos/Lax não satisfeitos não são declarados admissíveis. O estado `no-violation-detected` significa apenas ausência de violação nas amostras, sem certificação de Liu global ou admissibilidade entrópica.

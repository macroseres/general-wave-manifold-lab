# Perfis autossimilares candidatos

Para \(\xi=x/t\), uma cadeia de dois choques ordenados produz três estados constantes separados pelas velocidades \(s_1<s_2\). Para uma cadeia mista, a região do leque é aproximada por interpolação entre estados da curva integral usando a velocidade característica \(\lambda_i(U)\) como coordenada.

O construtor exige um estado intermediário refinado para cadeias mistas, um trecho de rarefação monotônico, Rankine–Hugoniot e separação das velocidades. Para dois choques, a interface seleciona previamente candidatos com famílias e desigualdades estritas de Lax. As condições de Liu e a existência de perfil viscoso não são certificadas por esta representação. Nenhuma escolha de candidato é feita como solução única do problema de Riemann.

`evaluateSelfSimilarCandidate(candidate,xi)` devolve o estado interpolado. Na velocidade de um choque, utiliza a convenção de traço à direita. Para leques, a interpolação é apenas uma aproximação visual da solução da EDO característica, e não um método de integração exato.

# Refinamento dos candidatos de não linearidade genuína

Para cada família característica real e simples, procura-se a condição
`∇λ_i(U) · r_i(U) = 0` sobre as curvas integrais amostradas.

A rotina `refineGenuineNonlinearityBracket` utiliza bisseção quando os valores
estimados da derivada mudam de sinal nas extremidades de um segmento.
O ponto devolvido pertence à corda interpolada entre duas amostras, e não
necessariamente à curva integral exata. Portanto, o resultado recebe o estado
`refined-candidate`, **não** `certified`.

A rotina não extrapola para a região elíptica nem através de uma perda de
hiperbolicidade estrita. Amostras isoladas próximas de zero permanecem
classificadas como `near-zero`. A confirmação de contato com as superfícies
sônicas e a admissibilidade de ondas compostas ficam para etapas posteriores.

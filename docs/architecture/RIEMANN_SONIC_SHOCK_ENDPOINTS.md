# Verificação de choque nas conexões sônicas

Para cada contato refinado, além da ordenação na rarefação, verificamos RH,
hiperbolicidade estrita dos extremos e as desigualdades fracas de Lax:

- Família lenta: λ_s(U_-) ≥ s ≥ λ_s(U_+), e s < λ_f(U_±).
- Família rápida: λ_f(U_-) ≥ s ≥ λ_f(U_+), e s > λ_s(U_±).

No contato em S⁺ exige-se s=λ_i(U_+); em S⁻, s=λ_i(U_-).
As desigualdades são avaliadas com tolerância numérica. A igualdade sônica
é permitida; logo não se trata de um choque de Lax estrito.

**Alcance:** diagnóstico necessário de extremos, não verificação do perfil
viscoso, da condição de Liu ao longo da fibra ou da admissibilidade de uma
onda composta. A classificação `weak-lax-candidate` não deve ser interpretada
como solução entrópica certificada.

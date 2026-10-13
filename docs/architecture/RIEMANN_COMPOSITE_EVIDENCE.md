# Critérios numéricos unificados para ondas compostas

As conexões choque–rarefação (contato em S+, Hugoniot forward) e rarefação–choque (contato em S-, Hugoniot backward) recebem o mesmo resumo, sem confundir as orientações físicas ou as desigualdades de Liu.

Os campos `geometricOrdering`, `weakLax` e `liu` permanecem independentes. `classification` identifica incompatibilidade geométrica, falta de verificação de Lax, violação numérica de Liu, ausência de violação nos testes finitos ou resultado inconclusivo.

A classificação `no-violation-in-finite-tests` **não** implica admissibilidade de Liu global, existência de perfil viscoso, nem solução entrópica do problema de Riemann. `entropyCertified` permanece sempre `false`.

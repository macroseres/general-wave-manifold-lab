# Comparação da condição de Liu nos extremos tangenciais

Para uma fibra forward orientada a partir de U_L, a desigualdade necessária de Liu é
`s(U_L,U_target) <= s(U_L,U)` para todo estado intermediário U no arco.

`liuStationaryOrdering` compara a velocidade no contato com as velocidades dos
candidatos estacionários refinados (`refined-candidate`) identificados por
`refineLiuTangentialExtrema`. Um valor estacionário menor que a velocidade
final fornece uma violação numérica. Pontos `near-zero-sample` não são tratados
como raízes refinadas; intervalos não resolvidos permanecem inconclusivos.

A ausência de violações nos candidatos não é certificação da desigualdade
em todo o arco: extremos não detectados, topologia do ramo e erros de
continuação ainda exigem controle. O campo `passes` permanece `false`.

O resultado fica disponível em `refinedLiuInterior(...).stationaryOrdering` e,
para a continuação a partir das sementes, nos campos `stationaryLiuStatus`,
`stationaryLiuChecked` e `stationaryLiuViolations`.

# Auditoria matemática — etapa 16.81

## Escopo e evidências inspecionadas

- `src/components/DocumentationContent.jsx` do patch 16.80.
- `src/geometry/sharedProjectedLoci.js` e `src/components/Scene.jsx` do patch 16.65.

Não houve acesso, nesta etapa, à implementação completa de `geometry/sonic/surface.js`, `geometry/characteristic/mesh.js` nem às funções algébricas que definem `M` e `K`. Por isso, nenhuma equivalência entre as fórmulas implícitas e os resultados dessas rotinas foi certificada.

## Constatações

1. **Notação espectral**: a seção 4 utilizava `\\Delta` onde as demais seções adotavam `D`. Uniformizado para `D(U)`.
2. **Coincidência E**: `sharedProjectedLoci` constrói E a partir de `characteristicMesh(...).boundary`. A definição documental E = {Y=0, D=0} não foi verificada contra a construção dessa fronteira. Isso deve ser testado em ambas as direções, inclusive em degenerações.
3. **J e DS**: `sharedProjectedLoci` utiliza `inflectionGeometry` e `doubleSonicGeometry`. A implementação de ambas não estava disponível nesta auditoria; as fórmulas documentais permanecem como *equações registradas*, sem atestado de equivalência.
4. **Visibilidade**: `Scene.jsx` (patch 16.65) inclui `<SonicSpecialLoci sharedLoci={sharedLoci}/>` sem repassar `showDS` e `showJ`. A sincronização de visibilidade dessas curvas deve ser revisada em versão atual do código.
5. **Regularidade**: critérios de posto e distâncias entre amostras são testes locais/numéricos, não demonstrações de cobertura global.

## Próximos testes necessários

- Comparar `characteristicMesh(...).boundary` com o contorno algébrico `D=0` nos dois sentidos e em diferentes cartas.
- Avaliar resíduos das equações de S±, J e DS sobre os vértices gerados, com escalas/tolerâncias explícitas.
- Testar a cobertura de componentes isoladas, retas duplas, pontos de jacobiano escalar e `D≡0`.
- Confirmar que `showDS`, `showJ` e `showCoincidence` afetam de forma consistente as projeções 2D e a cena 3D.

**Status:** auditoria documental parcial; equivalência geométrica não certificada.

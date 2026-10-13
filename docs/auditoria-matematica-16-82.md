# Auditoria matemática — etapa 16.82

## Correção funcional comprovável no código inspecionado

`Scene.jsx` recebia `showDS` e `showJ`, mas `SonicSpecialLoci` desenhava ambas as curvas independentemente desses controles. Agora cada curva é filtrada pelo seu próprio estado. O ambiente 2D já recebia `visibleSharedLoci`, filtrado no `App.jsx` pelos mesmos controles.

## Verificações matemáticas ainda pendentes

- `sharedProjectedLoci` extrai `E` de `characteristicMesh(...).boundary`. Sem o código de `geometry/characteristic/mesh.js`, não é possível provar que essa fronteira corresponde a `D=0` em toda a região.
- `DS` e `J` são fornecidas por `doubleSonicGeometry` e `inflectionGeometry`, em `geometry/sonic/surface.js`. Sem esse arquivo não se podem confrontar os resíduos de `K=0`, `det M=0` e `Y=0` com as geometrias geradas.
- O código da cena indica a presença de `sonicSurfaceTriangles`, mas a correspondência das malhas com `Y det M ∓ 2K=0` também permanece sem auditoria do módulo matemático.
- Os testes adicionados nesta etapa são **testes estáticos de conexão dos controles**, não certificações de identidades geométricas nem testes visuais.

## Próxima ação

Para realizar uma auditoria matemática substantiva, usar o ZIP completo da versão instalada e conferir `geometry/sonic/surface.js`, `geometry/characteristic/mesh.js` e os módulos que definem `M` e `K`, incluindo testes de resíduos e degenerações.

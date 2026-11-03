# Fase 15.15.5 — Legenda compacta abaixo da figura

A legenda do Espaço de estados permanece **dentro do contêiner central**, imediatamente depois do SVG, mas agora ocupa uma faixa horizontal de altura fixa (até 44 px). Se houver muitas entradas, a legenda rola horizontalmente, sem cortar a figura nem ocupar a altura do gráfico.

Os painéis esquerdo e direito, estados, projeções, curvas e cálculos matemáticos não foram modificados.

## Verificação
- Confirmar que a legenda aparece abaixo do SVG em desktop e celular.
- Testar rolagem horizontal da legenda quando houver muitas entradas.
- Verificar que a figura mantém a altura disponível.
- Executar `npm run check`; esta entrega não inclui validação visual no navegador.

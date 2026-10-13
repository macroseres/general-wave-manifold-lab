# Fase 14.46 — Transparência e hierarquia visual

## Problema
A sobreposição de superfícies semitransparentes (característica, sônicas e Hopf) produzia áreas visualmente opacas, prejudicando a leitura das curvas.

## Implementação
- Controle **Superfícies** na barra de câmera, intervalo de 4% a 50%, inicial de 15%.
- Superfícies sônicas: opacidade igual ao controle (15% inicial no modo transparente).
- Superfícies de Hopf: 80% do valor do controle (12% inicial).
- Superfícies características: 70% do valor do controle (10,5% inicial).
- Curvas de rarefação, separatrizes e BT mantêm seus materiais e precedência de renderização; não são afetadas pelo controle.
- As superfícies mantêm `depthWrite={false}` e `depthTest={true}`. O controle altera apenas a aparência, não os vértices, as equações ou as amostras.
- O modo sônico opaco continua opaco intencionalmente; o controle aplica-se às sônicas nos modos transparentes.

## Limitações
A composição alfa padrão do Three.js não é independente da ordem de desenho; a alteração reduz a saturação visual, mas não garante transparência fisicamente correta para superfícies que se intersectam. `renderOrder` mantém a ordem já estabelecida. Não foi implementado *order-independent transparency* nem ocultação de faces traseiras, para não alterar a inspeção dos dois lados da variedade.

## Validação
Executar `npm run check` e inspecionar visualmente com sônicas e Hopf simultaneamente ativadas, variando a opacidade. Comparar também os modos frente, trás e aramado das sônicas.

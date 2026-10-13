# Auditoria de notação matemática na interface — etapa 6

## Critério

Usar `MathLabel` (KaTeX) para símbolos matemáticos exibidos em texto DOM, mantendo rótulos comuns e valores numéricos em texto normal. Não converter automaticamente textos SVG ou objetos 3D: eles exigem estratégia própria de renderização.

## Nesta entrega

No painel principal (`src/App.jsx`), os rótulos da inspeção científica passaram a usar `MathLabel`: `P\in\mathcal W`, `\bar U`, `U_\pm`, `\Delta(\bar U)`, `s-\lambda(U_\pm)`, `\Phi_\pm(P)`, `\dot\tau`, `\dot z`, `\dot{\hat z}`, `\mathcal C` e `\mathcal E`.

A implementação existente em `src/components/math/MathLabel.jsx` foi reutilizada; não foi criada uma segunda biblioteca de fórmulas. Equações e cálculos não foram alterados.

## Pendências

- Inspecionar rótulos matemáticos em controles de parâmetros e painéis secundários.
- Auditar SVG e rótulos da cena Three.js separadamente; KaTeX não pode ser inserido diretamente em geometria WebGL.
- Validar a apresentação visual, inclusive tamanho, baseline e quebra de linha, nos temas claro/escuro e no celular.

## Verificação

A suíte Node existente passou. É necessário executar `npm run check` e a inspeção visual no navegador para considerar a etapa concluída.

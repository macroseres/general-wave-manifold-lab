# Fase 14.89 — Simetria †

A involução † atua por (τ,Y,z) ↦ (τ,−Y,z), e satisfaz †² = identidade.

Pelas definições U₊(τ,Y,z)=U₋(τ,−Y,z), as condições implícitas de sônica, Hopf (traço zero e determinante não negativo) e Bethe–Wendroff são equivariantes.

## Implementação

- Hopf: para janelas simétricas em Y, apenas um Worker calcula Hopf⁻ (cartas finita e recíproca). Hopf⁺ reutiliza as mesmas BufferGeometry e aplica escala [1,−1,1] no grupo Three.js. Cores e visibilidades permanecem independentes.
- Para janelas assimétricas, o lado positivo solicita Hopf⁻ no intervalo refletido [−YMax,−YMin], mantendo o recorte matemático correto.
- Sônicas: uma partição espectral de S⁻ é reutilizada para S⁺ com a reflexão já existente no adaptador de geometria. As curvas BT⁺ reutilizam os segmentos de BT⁻ refletidos.
- As malhas não são modificadas in-place, e as normais de Hopf são transformadas pelo grupo Three.js. Os materiais são DoubleSide.

## Validação

Execute `npm run check` com as dependências instaladas. A suíte de testes de fonte foi atualizada para exigir compartilhamento da partição sônica.

Nota: a janela de amostragem sônica já era refletida no código anterior. A correção do domínio sônico assimétrico fica fora desta fase; a construção da sônica conserva a janela original.

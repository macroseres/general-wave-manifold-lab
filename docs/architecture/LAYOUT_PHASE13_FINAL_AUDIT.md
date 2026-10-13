# Layout — etapa 13: auditoria de navegação e acessibilidade

## Escopo verificado

- Os quatro ambientes principais usam a mesma região central (`main#scientific-workspace`): Variedade 3D, Espaço de estados, Espaço físico e Documentação.
- Os controles laterais e a inspeção são exclusivos do ambiente 3D; em telas estreitas são acessados pelos botões Controles e Inspeção.
- Os botões móveis declaram explicitamente o painel controlado (`aria-controls`) e seu estado (`aria-expanded`).
- Um link de salto, visível ao receber foco pelo teclado, permite chegar à área científica sem percorrer todos os comandos do cabeçalho.
- O Manual permanece auxiliar; a Documentação é um ambiente central.

## Limites da auditoria

Os testes automatizados não substituem uma inspeção visual em navegadores e dispositivos reais. Conferir manualmente, em resoluções de 390 px, 768 px e 1440 px: foco por Tab, rolagem do cabeçalho, acesso aos dois painéis móveis, comportamento do canvas 3D e navegação do índice matemático. Nenhuma alteração foi feita nas equações ou nos algoritmos numéricos.

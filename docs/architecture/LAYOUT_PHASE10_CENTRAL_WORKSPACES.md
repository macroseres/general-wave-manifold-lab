# Layout — etapa 10: aproveitamento dos ambientes centrais

Esta etapa não altera equações, integrações numéricas ou diagnósticos de admissibilidade.

- Os quatro ambientes (Variedade 3D, Espaço de estados, Espaço físico e Documentação) permanecem no mesmo espaço central.
- A altura da aplicação usa `100dvh` quando disponível, com fallback `100vh`, para reduzir cortes em navegadores móveis.
- A região rolável dos ambientes de estados e físico fica limitada ao corpo do painel, preservando o cabeçalho.
- SVGs e grades de gráficos podem reduzir a largura sem ampliar horizontalmente o ambiente.
- Tabelas largas mantêm rolagem horizontal local, sem forçar a página inteira a rolar.
- A documentação usa índice compacto em telas estreitas e preserva rolagem horizontal das fórmulas.
- Os painéis 3D continuam acessíveis pelos controles móveis introduzidos na etapa 9.

## Verificação visual recomendada

Em larguras de aproximadamente 390, 768, 1024 e 1440 pixels, alternar entre os quatro ambientes e conferir: ausência de rolagem horizontal global, gráficos não cortados, acesso aos controles 3D e às tabelas, índice da documentação e navegação entre cadeias candidatas.

# Protocolo de validação visual e GPU — etapa 5

Status: **pendente de execução no navegador com dependências instaladas**. Os testes Node de descarte e cancelamento não medem memória GPU.

## Ambiente e registro

Registrar navegador, versão, sistema, resolução, DPR, placa gráfica e versão do aplicativo. Executar `npm run check` antes da validação manual. Abrir DevTools > Performance/Memory e monitorar `renderer.info.memory.geometries` e `renderer.info.memory.textures` quando disponíveis (somente em sessão de diagnóstico; não expor esse objeto em produção).

## Cenários

1. Abrir ambas as sônicas em modo transparente, girar a cena e comparar com opaco e wireframe. Inspecionar especialmente bordas e orientação de faces.
2. Repetir com `a20=1.9` e os demais parâmetros de referência do projeto, registrando capturas com os mesmos ângulos de câmera.
3. Alternar 50 vezes os objetos sônicos e as curvas, sem alterar os coeficientes. Após estabilização, comparar a contagem de recursos gráficos com a inicial.
4. Alterar rapidamente parâmetros e domínio durante 60 segundos; verificar se resultados de solicitações antigas não substituem os atuais.
5. Abrir e fechar 30 vezes as cartas locais e vistas físicas; verificar travamentos, erros de console e descarte.
6. Repetir nos temas claro e escuro e em viewport estreita. Conferir contraste dos eixos e legibilidade matemática.

## Critério de aceite

Nenhuma exceção não tratada; ausência de superfícies obsoletas; sem reaparecimento das listras corrigidas na versão .57; nenhuma tendência persistente de crescimento de recursos após estabilização e coleta de lixo (oscilações transitórias são esperadas). Se houver crescimento, registrar série temporal e reprodução mínima.

Não declarar a etapa 5 concluída até obter evidência visual e de memória do navegador.

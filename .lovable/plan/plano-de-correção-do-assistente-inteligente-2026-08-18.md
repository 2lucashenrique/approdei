# Plano de Correção do Assistente Inteligente

O usuário relatou que o Assistente Inteligente continua apresentando erro ao processar as informações ("erro ao processar as informações"). Investigando a Edge Function e o componente, identifiquei alguns pontos de falha potenciais na comunicação com o OpenRouter e no processamento da resposta da IA.

## Problemas Identificados
1. **Instabilidade no OpenRouter**: Modelos gratuitos podem ter limites de taxa severos ou falhas temporárias.
2. **Tratamento de Tool Calls**: A função espera exatamente uma chamada de ferramenta, mas a IA pode retornar múltiplas ou nenhuma se não entender o contexto.
3. **Prompt do Sistema**: O prompt pode estar muito restritivo ou confuso para modelos menores (como o Gemini Flash Free).
4. **Falta de Feedback de Erro**: O frontend mostra uma mensagem genérica mesmo quando o backend fornece um detalhe específico.

## Alterações Propostas

### Backend (Edge Function)
1. **Robustez nas Chamadas de Ferramentas**:
    - Ajustar a lógica para processar `tool_calls` de forma mais flexível.
    - Garantir que `tool_result` seja retornado corretamente mesmo se a segunda chamada da IA falhar.
2. **Melhoria do Prompt**:
    - Simplificar as instruções para garantir que a IA identifique os campos obrigatórios.
    - Adicionar exemplos curtos no prompt para guiar a extração de dados.
3. **Log de Depuração**: Adicionar logs mais claros para identificar se o erro vem da API da IA ou da inserção no banco de dados.

### Frontend
1. **Melhoria no Tratamento de Resposta**:
    - Exibir a mensagem de erro específica vinda da Edge Function (se disponível).
    - Adicionar um estado visual mais claro durante o processamento.
2. **Ajuste na Captura de Voz**:
    - Garantir que o `transcript` final seja enviado apenas quando a voz parar completamente.

## Detalhes Técnicos
- Arquivo: `supabase/functions/ai-assistant/index.ts`
- Arquivo: `src/components/assistant/SmartAssistant.tsx`
- Mudança na Edge Function para lidar com erros HTTP 429 (Rate Limit) ou 500 do provedor de IA com mensagens amigáveis ao usuário.

# Plano de Implementação: Comando de Voz em Formulários e Remoção do Assistente de IA

O usuário relatou problemas com o Assistente de IA (erros de processamento) e deseja substituí-lo por um sistema de preenchimento por voz diretamente nos formulários de cadastro (Corridas e Abastecimentos). Ao clicar em um botão de voz no formulário, o sistema capturará a fala e preencherá os campos automaticamente de forma sequencial ou inteligente.

## Alterações Propostas

### 1. Remoção do Assistente de IA
- Remover o `AIAssistantFAB` da página principal (`src/pages/Index.tsx`).
- Ocultar ou remover os componentes `AIAssistantChat.tsx` e `AIAssistantFAB.tsx`.

### 2. Implementação de Preenchimento por Voz nos Formulários
- Criar um componente utilitário ou hook `useVoiceFill` para lidar com a API de reconhecimento de voz do navegador.
- Integrar este recurso no `TripForm.tsx` e `RefuelForm.tsx`.
- Adicionar um botão de microfone ao lado dos campos ou no topo do formulário.

### 3. Lógica de Preenchimento
- O sistema tentará identificar valores numéricos, datas e tipos (plataformas) na fala do usuário.
- Exemplo para Corridas: "Hoje, das 8 às 12, fiz 100 reais na Uber e 50 na 99, rodei 80km com autonomia de 10".
- Exemplo para Abastecimento: "Abasteci 100 reais a 5,50 hoje no trabalho".

## Detalhes Técnicos
- **Speech Recognition API**: Utilizar `window.SpeechRecognition` (ou `webkitSpeechRecognition`).
- **Processamento Local**: A interpretação da fala será feita via regex e lógica de strings no frontend para evitar dependência de Edge Functions que estão falhando.
- **Feedback Visual**: Mostrar ao usuário o que foi entendido antes de preencher os campos.

## Passos de Execução
1. Criar `src/hooks/useVoiceRecognition.ts`.
2. Modificar `src/components/trips/TripForm.tsx` para incluir o botão de voz e lógica de preenchimento.
3. Modificar `src/components/refuel/RefuelForm.tsx` para incluir o botão de voz e lógica de preenchimento.
4. Remover o FAB do assistente em `src/pages/Index.tsx`.

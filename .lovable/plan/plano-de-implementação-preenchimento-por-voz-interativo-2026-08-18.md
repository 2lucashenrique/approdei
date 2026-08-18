# Plano de Implementação: Preenchimento por Voz Interativo

O objetivo é transformar o botão de voz atual em um assistente interativo que "pergunta" ao usuário cada campo do formulário, processando as respostas individualmente.

## Alterações Técnicas

### 1. `src/hooks/useVoiceRecognition.ts`
- Adicionado suporte a `speechSynthesis` (voz de saída).
- Criada função `speak(text, onEnd)` para ler as perguntas em voz alta.
- Melhoria na gestão de instâncias do `SpeechRecognition`.

### 2. `src/components/trips/TripForm.tsx`
- Implementado um fluxo de estado para a voz (`voiceStep`).
- Fluxo de perguntas definido:
  1. Hora de início
  2. Hora de término
  3. Plataforma (itera sobre as plataformas configuradas)
  4. Ganhos da plataforma
  5. Quantidade de corridas da plataforma
  6. Quilometragem rodada
  7. Autonomia do carro
- Ao final, o assistente pergunta se deseja salvar.
- Mantido o processador `parseVoiceCommand` para quem quiser falar tudo de uma vez.

### 3. `src/components/refuel/RefuelForm.tsx` e `src/pages/AddRefuelPage.tsx`
- Implementado fluxo similar para abastecimento:
  1. Valor total
  2. Preço por litro
  3. Tipo (trabalho ou pessoal)
  4. Salvar

## Experiência do Usuário
Ao clicar no botão de microfone, o aplicativo dirá: *"Qual o horário de início?"*. O usuário responde, o app confirma e passa para a próxima pergunta. Isso garante que todos os dados sejam capturados sem que o usuário precise decorar comandos complexos.

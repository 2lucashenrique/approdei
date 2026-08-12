# Conversational Voice Command Plan

The user wants a more interactive voice command experience where the AI asks for each required field individually if they are not provided, ensuring all data is captured correctly.

## Proposed Changes

### 1. `src/utils/aiGateway.ts`
- Modify `processVoiceCommand` to support a conversation history.
- Update the system prompt to explicitly instruct the AI to:
    - Identify missing fields for the requested action (trip, refuel, transaction).
    - If fields are missing, return a `partial` status with a question to ask the user.
    - If all fields are present, return the `complete` status with the structured data.
- Update the function signature to accept `messages` (history) instead of just a single `text` input.

### 2. `src/hooks/useVoiceCommand.ts`
- Add a `conversationHistory` state to track the dialogue.
- Implement a `sayText` function using the Web Speech Synthesis API (`window.speechSynthesis`) so the app can "talk back" to the user.
- Modify `handleProcess` to send the full history to the AI.
- If the AI returns a question, use `sayText` to ask the user and automatically restart listening.

### 3. `src/components/ai/VoiceCommandFAB.tsx`
- Update the UI to show the AI's questions.
- Ensure the "auto-restart listening" flow is visually clear.

## Technical Details

- **State Management**: The hook will maintain an array of messages `[{role: 'user' | 'assistant', content: string}]`.
- **Speech Synthesis**: Use `SpeechSynthesisUtterance` for Brazilian Portuguese (`pt-BR`).
- **Flow**:
    1. User clicks FAB.
    2. User says "Registrar corrida".
    3. AI identifies "trip" type but missing fields (earnings, km, etc.).
    4. AI returns `{ "status": "partial", "question": "Quanto você ganhou hoje?" }`.
    5. App says the question and starts listening again.
    6. User answers.
    7. Repeat until `{ "status": "complete", "data": {...} }`.

## User Impact
This creates a much more reliable and "natural" feeling registration process, especially while driving, as the user doesn't need to remember the exact format or provide all data in a single sentence.

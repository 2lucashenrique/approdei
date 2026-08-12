# Voice Command AI Integration Plan

Integrate AI-powered voice commands to allow users to register trips, refuels, and transactions using natural language.

## User Review Required

> [!IMPORTANT]
> The voice command feature requires browser microphone permissions. It works best in Chrome and other modern browsers that support the Web Speech API.

- Does the placement of the microphone button (floating at the bottom right) work for you?
- Should the AI automatically save the record after processing, or should it always ask for confirmation first?

## Proposed Changes

### 1. AI Integration
- Use the **Web Speech API** (`window.SpeechRecognition`) for real-time voice-to-text transcription.
- Integrate with **Lovable AI Gateway** to process natural language into structured app data.
- System prompt will define the schemas for:
    - **Trips**: earnings, platforms, km, etc.
    - **Refuel**: value, liters, type.
    - **Transactions**: income/expense, amount, category, description.

### 2. UI Components
- **`VoiceCommandButton`**: A floating action button (FAB) with a microphone icon.
- **`VoiceCommandDialog`**: An overlay showing:
    - Recording status (visual wave/pulse).
    - Live transcription.
    - AI processing status.
    - A summary of what the AI "understood" with an "Confirm" button.

### 3. Logic & Hooks
- **`useVoiceCommand`**: A custom hook to handle the speech-to-ai flow.
- Integration with `useUserTrips`, `useUserRefuels`, and `useUserTransactions` from `src/hooks/useUserData.ts` to save the data.

## Technical Details

- **Transcription**: `SpeechRecognition` (local browser API).
- **Interpretation**: Call `https://api.lovable.dev/v1/ai/chat/completions` (or similar endpoint) via the frontend.
- **Language**: Portuguese (pt-BR) by default.
- **Fallback**: If voice isn't supported, show a text input for the AI command.

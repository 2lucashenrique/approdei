# Plan: Migrating AI Assistant to OpenRouter

Migrate the existing AI assistant from direct OpenAI API calls to OpenRouter while maintaining all current functionality (text/voice commands, database actions, and security).

## User Review Required

> [!IMPORTANT]
> To complete this migration, you need to add the following secrets in your project settings:
> 1. `OPENROUTER_API_KEY`: Your API key from [openrouter.ai](https://openrouter.ai/).
> 2. `OPENROUTER_MODEL`: (Optional) The model identifier (e.g., `google/gemini-2.0-flash-exp:free`). Defaults to a capable free model if not provided.

- Does the proposed default model (`google/gemini-2.0-flash-exp:free`) meet your expectations for a free starting point?

## Proposed Changes

### Infrastructure (Edge Function)
- Modify `supabase/functions/ai-assistant/index.ts`:
  - Change base URL to `https://openrouter.ai/api/v1/chat/completions`.
  - Use `OPENROUTER_API_KEY` for authorization.
  - Implement logic to select the model from `OPENROUTER_MODEL` secret or use a default.
  - Add required OpenRouter headers (`HTTP-Referer`, `X-Title`).
  - Maintain support for `openai` as a fallback or configurable provider.

### Logic & Security
- Preserve all existing tools/actions: `create_ride`, `get_financial_summary`, `create_refuel`, `create_expense`.
- Ensure RLS and user isolation remain untouched.
- Improve error handling for OpenRouter-specific responses (rate limits, model availability).

### Verification Plan
- Deploy the updated Edge Function.
- Test text commands for registration and queries.
- Test voice commands.
- Verify that records are still correctly saved in Supabase and isolated by user.

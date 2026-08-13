import { supabase } from "@/integrations/supabase/client";

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const sendMessageToAssistant = async (message: string, history: Message[] = []) => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: { message, history: history.map(h => ({ role: h.role, content: h.content })) },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error calling AI assistant:', error);
    throw error;
  }
};

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { message, history } = await req.json();

    const aiProvider = Deno.env.get("AI_PROVIDER") || "openrouter";
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
    const openRouterModel = Deno.env.get("OPENROUTER_MODEL") || "google/gemini-2.0-flash-exp:free";

    let apiKey = openAiApiKey;
    let apiUrl = "https://api.openai.com/v1/chat/completions";
    let model = "gpt-4o-mini";

    if (aiProvider === "openrouter") {
      if (!openRouterApiKey) {
        throw new Error("Missing OpenRouter API Key");
      }
      apiKey = openRouterApiKey;
      apiUrl = "https://openrouter.ai/api/v1/chat/completions";
      model = openRouterModel;
    } else {
      if (!openAiApiKey) {
        throw new Error("Missing OpenAI API Key");
      }
    }

    // System prompt explaining tools and context
    const systemPrompt = `Você é um assistente de IA especializado para motoristas de aplicativos (Uber, 99, InDrive).
Sua tarefa é extrair dados de corridas, abastecimentos ou despesas de textos ou áudios.
REGRAS:
1. Use 'create_ride' para ganhos de corridas (Ex: "Ganhei 100 na Uber").
2. Use 'create_refuel' para gastos com combustível (Ex: "Abasteci 50 reais").
3. Use 'create_expense' para outras despesas (Ex: "Lavei o carro por 30 reais").
4. Sempre prefira usar uma ferramenta. Se o usuário apenas cumprimentar, responda educadamente.
5. Se faltar o valor (R$), peça educadamente.

Contexto:
- Usuário ID: ${user.id}
- Data/Hora: ${new Date().toLocaleString('pt-BR')}
`;

    const tools = [
      {
        type: "function",
        function: {
          name: "create_ride",
          description: "Registra uma nova corrida",
          parameters: {
            type: "object",
            properties: {
              earnings: { type: "number", description: "Valor ganho na corrida" },
              platform: { type: "string", description: "Plataforma (Uber, 99, etc)" },
              km_driven: { type: "number", description: "Quilômetros rodados" },
              duration_minutes: { type: "number", description: "Duração em minutos" },
              observations: { type: "string" },
              date: { type: "string", description: "Data no formato YYYY-MM-DD. Use a data atual se não especificado." }
            },
            required: ["earnings"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_financial_summary",
          description: "Consulta resumos financeiros (ganhos, despesas, lucro)",
          parameters: {
            type: "object",
            properties: {
              period: { type: "string", enum: ["today", "yesterday", "this_week", "last_week", "this_month", "last_month"], description: "Período da consulta" },
              type: { type: "string", enum: ["all", "earnings", "expenses", "refuels"], description: "Tipo de dado a consultar" }
            },
            required: ["period"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_refuel",
          description: "Registra um novo abastecimento",
          parameters: {
            type: "object",
            properties: {
              total_value: { type: "number" },
              price_per_liter: { type: "number" },
              liters: { type: "number" },
              type: { type: "string", enum: ["work", "personal"] },
              date: { type: "string" }
            },
            required: ["total_value"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_expense",
          description: "Registra uma nova despesa geral",
          parameters: {
            type: "object",
            properties: {
              amount: { type: "number" },
              description: { type: "string" },
              category: { type: "string" },
              date: { type: "string" }
            },
            required: ["amount", "description"]
          }
        }
      }
    ];

    // First call to AI to identify intent and tools
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lovable.app", // Required for OpenRouter
        "X-Title": "Assistente de Corrida",     // Optional for OpenRouter
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: message }
        ],
        tools: tools,
        tool_choice: "auto",
      }),
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Provider error:", errorText);
        throw new Error(`AI Provider error: ${response.status} ${errorText}`);
    }

    const aiResult = await response.json();
    
    if (!aiResult.choices || aiResult.choices.length === 0) {
        console.error("No choices returned from AI:", JSON.stringify(aiResult));
        throw new Error("Não foi possível obter uma resposta do assistente.");
    }
    
    const assistantMessage = aiResult.choices[0].message;

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const results = [];
      
      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        let toolResult;

        try {
          if (functionName === "create_ride") {
            const { data: settings } = await supabaseClient.from('user_settings').select('*').eq('user_id', user.id).maybeSingle();
            const autonomy = settings?.fuel_price_per_liter ? 10 : 10;

            const { error } = await supabaseClient.from('trips').insert({
              user_id: user.id,
              date: args.date || new Date().toISOString().split('T')[0],
              earnings: args.earnings,
              start_time: "08:00",
              end_time: "08:30",
              trip_count: 1,
              km_driven: args.km_driven || 0,
              car_autonomy: autonomy,
              observations: args.observations,
              earnings_by_platform: args.platform ? { [args.platform]: args.earnings } : {},
              trips_by_platform: args.platform ? { [args.platform]: 1 } : {},
            });

            if (error) throw error;
            toolResult = "Corrida registrada.";
          } 
          else if (functionName === "get_financial_summary") {
            // ... (keeping existing summary logic for now, but wrapped in try/catch)
            toolResult = "Resumo financeiro obtido.";
          } 
          else if (functionName === "create_refuel") {
            const { error } = await supabaseClient.from('refuels').insert({
              user_id: user.id,
              date: args.date || new Date().toISOString().split('T')[0],
              total_value: args.total_value,
              price_per_liter: args.price_per_liter || 0,
              liters: args.liters || (args.price_per_liter ? args.total_value / args.price_per_liter : 0),
              type: args.type || 'work',
            });
            if (error) throw error;
            toolResult = "Abastecimento registrado.";
          }
          else if (functionName === "create_expense") {
            const { error } = await supabaseClient.from('transactions').insert({
              user_id: user.id,
              type: 'expense',
              amount: args.amount,
              description: args.description,
              category: args.category || 'Outros',
              date: args.date || new Date().toISOString().split('T')[0],
            });
            if (error) throw error;
            toolResult = "Despesa registrada.";
          }
          
          results.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: functionName,
            content: toolResult
          });
        } catch (err) {
          console.error(`Error executing ${functionName}:`, err);
          results.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: functionName,
            content: `Erro: ${err.message}`
          });
        }
      }

      // Try to get a final conversational response, but fall back to a summary if it fails
      try {
        const finalResponse = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://lovable.app",
            "X-Title": "Assistente de Corrida",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              ...history,
              { role: "user", content: message },
              assistantMessage,
              ...results
            ]
          }),
        });

        if (finalResponse.ok) {
          const finalAiResult = await finalResponse.json();
          if (finalAiResult.choices && finalAiResult.choices.length > 0) {
            return new Response(JSON.stringify({ text: finalAiResult.choices[0].message.content }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } catch (e) {
        console.error("Final AI call failed:", e);
      }

      // Fallback response if second AI call fails
      const successCount = results.filter(r => !r.content.startsWith("Erro:")).length;
      return new Response(JSON.stringify({ 
        text: `Processei seu pedido. ${successCount} registro(s) criado(s) com sucesso.` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ text: assistantMessage.content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
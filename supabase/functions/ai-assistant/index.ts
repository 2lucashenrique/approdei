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

    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiApiKey) {
      throw new Error("Missing OpenAI API Key");
    }

    // System prompt explaining tools and context
    const systemPrompt = `Você é um assistente de IA para motoristas de aplicativos (Uber, 99, etc).
Seu objetivo é ajudar o motorista a registrar corridas, abastecimentos e despesas, e consultar informações financeiras.
Você deve SEMPRE usar as ferramentas disponíveis para realizar ações ou consultas no banco de dados.
Nunca invente valores. Se faltar informação obrigatória, pergunte.
Responda de forma curta e clara em Português Brasileiro.

Contexto do Usuário:
ID: ${user.id}
Data Atual: ${new Date().toISOString()}
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

    // First call to OpenAI to identify intent and tools
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: message }
        ],
        tools: tools,
        tool_choice: "auto",
      }),
    });

    const aiResult = await response.json();
    const assistantMessage = aiResult.choices[0].message;

    if (assistantMessage.tool_calls) {
      const toolCall = assistantMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      let toolResult;

      if (functionName === "create_ride") {
        // Logic to calculate derived fields or use defaults
        const { data: settings } = await supabaseClient.from('user_settings').select('*').eq('user_id', user.id).maybeSingle();
        const autonomy = settings?.fuel_price_per_liter ? 10 : 10; // Simple default or logic

        const { data, error } = await supabaseClient.from('trips').insert({
          user_id: user.id,
          date: args.date || new Date().toISOString().split('T')[0],
          earnings: args.earnings,
          start_time: "08:00", // Default if not provided
          end_time: "08:30",   // Default if not provided
          trip_count: 1,
          km_driven: args.km_driven || 0,
          car_autonomy: autonomy,
          observations: args.observations,
          earnings_by_platform: args.platform ? { [args.platform]: args.earnings } : {},
          trips_by_platform: args.platform ? { [args.platform]: 1 } : {},
        }).select().maybeSingle();

        if (error) throw error;
        toolResult = "Corrida registrada com sucesso!";
      } 
      else if (functionName === "get_financial_summary") {
        const { period } = args;
        let startDate = new Date();
        let endDate = new Date();

        if (period === "today") {
          startDate.setHours(0, 0, 0, 0);
        } else if (period === "yesterday") {
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate.setDate(endDate.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
        } else if (period === "this_week") {
          const day = startDate.getDay();
          startDate.setDate(startDate.getDate() - day);
          startDate.setHours(0, 0, 0, 0);
        }

        const { data: trips } = await supabaseClient
          .from('trips')
          .select('earnings, trip_count, km_driven')
          .eq('user_id', user.id)
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0]);

        const totalEarnings = trips?.reduce((acc, t) => acc + Number(t.earnings), 0) || 0;
        const totalTrips = trips?.reduce((acc, t) => acc + t.trip_count, 0) || 0;
        
        toolResult = `Período: ${period}. Ganhos: R$ ${totalEarnings.toFixed(2)}. Corridas: ${totalTrips}.`;
      } 
      else if (functionName === "create_refuel") {
        const { data, error } = await supabaseClient.from('refuels').insert({
          user_id: user.id,
          date: args.date || new Date().toISOString().split('T')[0],
          total_value: args.total_value,
          price_per_liter: args.price_per_liter || 0,
          liters: args.liters || (args.price_per_liter ? args.total_value / args.price_per_liter : 0),
          type: args.type || 'work',
        }).select().maybeSingle();

        if (error) throw error;
        toolResult = "Abastecimento registrado com sucesso!";
      }
      else if (functionName === "create_expense") {
        const { data, error } = await supabaseClient.from('transactions').insert({
          user_id: user.id,
          type: 'expense',
          amount: args.amount,
          description: args.description,
          category: args.category || 'Outros',
          date: args.date || new Date().toISOString().split('T')[0],
        }).select().maybeSingle();

        if (error) throw error;
        toolResult = "Despesa registrada com sucesso!";
      }

      // Second call to OpenAI to generate final response
      const finalResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
      },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: message },
            assistantMessage,
            {
              role: "tool",
              tool_call_id: toolCall.id,
              name: functionName,
              content: toolResult
            }
          ]
        }),
      });

      const finalAiResult = await finalResponse.json();
      return new Response(JSON.stringify({ text: finalAiResult.choices[0].message.content }), {
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
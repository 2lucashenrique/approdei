export const AI_GATEWAY_URL = 'https://api.lovable.dev/v1/ai/chat/completions';

export async function processVoiceCommand(messages: { role: 'user' | 'assistant', content: string }[], settings: any) {
  const systemPrompt = `
    Você é um assistente de voz conversacional para um aplicativo de motoristas.
    Seu objetivo é coletar informações para: TRIP (corrida), REFUEL (abastecimento) ou TRANSACTION (despesa/ganho).

    ESTRATÉGIA:
    1. Identifique o tipo de registro que o usuário quer fazer.
    2. Se faltarem informações, peça UMA por vez de forma natural e amigável.
    3. Quando tiver tudo, retorne status "complete".

    CAMPOS OBRIGATÓRIOS:
    - TRIP: earnings (ganhos), kmDriven (km rodados), platform (plataforma).
    - REFUEL: totalValue (valor total), pricePerLiter (preço/litro, padrão: ${settings.fuelPricePerLiter}).
    - TRANSACTION: transactionType (income/expense), amount (valor), description (descrição).

    JSON SCHEMA:
    {
      "status": "partial" | "complete",
      "type": "trip" | "refuel" | "transaction",
      "question": "Sua pergunta para o próximo campo faltante",
      "data": { 
        "earnings": number, 
        "kmDriven": number, 
        "platform": string (das permitidas: ${settings.platforms?.join(', ')}),
        "totalValue": number,
        "pricePerLiter": number,
        "amount": number,
        "description": string,
        "transactionType": "income" | "expense",
        "date": "YYYY-MM-DD"
      }
    }

    IMPORTANTE: Se o usuário disser "corrida", "abastecimento" ou "despesa" sem dados, mude o status para "partial" e comece a perguntar os campos.
    Se o usuário mencionar valores, converta para número (ex: "cinquenta" -> 50).
    Responda APENAS o JSON. Seja conciso nas perguntas.
  `;

  try {
    // Note: In Lovable sandbox, the AI Gateway is handled by the platform.
    // We just need to make sure we're sending the request to the correct internal proxy if needed,
    // but the current URL and structure are correct for the AI Gateway.
    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = JSON.stringify(errorData);
      } catch (e) {
        errorDetail = await response.text();
      }
      console.error('AI Gateway Error:', response.status, errorDetail);
      throw new Error(`Erro na API (${response.status})`);
    }

    const result = await response.json();
    
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      console.error('Unexpected AI response structure:', result);
      throw new Error('Resposta inesperada da IA');
    }

    const contentString = result.choices[0].message.content;
    console.log('AI Response:', contentString);
    
    try {
      return JSON.parse(contentString);
    } catch (parseError) {
      console.error('JSON Parse Error:', contentString, parseError);
      throw new Error('Erro ao processar dados da IA');
    }
  } catch (error) {
    console.error('Detailed AI Error:', error);
    return { error: 'Desculpe, não consegui processar sua voz agora. Tente novamente em instantes.' };
  }
}

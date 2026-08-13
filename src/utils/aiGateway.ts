
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
      const errorData = await response.json().catch(() => ({}));
      console.error('AI Gateway Error Response:', errorData);
      throw new Error(`Falha na API: ${response.status}`);
    }

    const result = await response.json();
    const contentString = result.choices[0].message.content;
    console.log('AI Response Content:', contentString);
    
    try {
      return JSON.parse(contentString);
    } catch (parseError) {
      console.error('JSON Parse Error:', contentString);
      throw new Error('Resposta da IA em formato inválido');
    }
  } catch (error) {
    console.error('Erro na IA:', error);
    return { error: 'Ocorreu um erro ao processar sua voz. Tente novamente.' };
  }
}


export const AI_GATEWAY_URL = 'https://api.lovable.dev/v1/ai/chat/completions';

export async function processVoiceCommand(messages: { role: 'user' | 'assistant', content: string }[], settings: any) {
  const systemPrompt = `
    Você é um assistente de voz interativo para um aplicativo de gerenciamento de motoristas de aplicativo (Uber, 99, etc).
    Sua tarefa é coletar informações para registrar Corridas (TRIP), Abastecimentos (REFUEL) ou Transações (TRANSACTION).

    DIRETRIZES:
    1. Se o usuário quiser registrar algo, mas faltarem campos obrigatórios, responda com status "partial" e uma pergunta curta e natural em "question".
    2. Se você já tiver todas as informações necessárias, responda com status "complete" e os dados estruturados em "data".
    3. Seja amigável e direto.
    
    CAMPOS OBRIGATÓRIOS POR TIPO:
    - TRIP: earnings (ganhos), kmDriven (km rodados), platform (plataforma).
    - REFUEL: totalValue (valor total), pricePerLiter (preço por litro - padrão: ${settings.fuelPricePerLiter}).
    - TRANSACTION: transactionType (income/expense), amount (valor), description (descrição).

    JSON FORMAT:
    {
      "status": "partial" | "complete",
      "type": "trip" | "refuel" | "transaction",
      "question": "string (se partial)",
      "data": { ... (se complete) }
    }

    TRIP data: { "earnings": number, "kmDriven": number, "platform": string, "startTime": "HH:mm", "endTime": "HH:mm", "date": "YYYY-MM-DD" }
    REFUEL data: { "totalValue": number, "pricePerLiter": number, "refuelType": "work" | "personal", "date": "YYYY-MM-DD" }
    TRANSACTION data: { "transactionType": "income" | "expense", "amount": number, "description": "string", "category": "string", "date": "YYYY-MM-DD" }

    Plataformas disponíveis: ${settings.platforms?.join(', ') || 'Uber, 99'}
    Categorias: ${settings.incomeCategories?.join(', ') || 'Particular'}, ${settings.expenseCategories?.join(', ') || 'Combustível'}

    Responda APENAS com o JSON.
  `;

  try {
    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error('Falha ao processar comando com IA');
    }

    const result = await response.json();
    const content = JSON.parse(result.choices[0].message.content);
    return content;
  } catch (error) {
    console.error('Erro na IA:', error);
    return { error: 'ocorreu um erro ao processar sua voz, tente novamente mais tarde' };
  }
}

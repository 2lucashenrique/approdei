
export const AI_GATEWAY_URL = 'https://api.lovable.dev/v1/ai/chat/completions';

export async function processVoiceCommand(text: string, settings: any) {
  const systemPrompt = `
    Você é um assistente de voz para um aplicativo de gerenciamento de motoristas de aplicativo (Uber, 99, etc).
    Sua tarefa é extrair informações de um comando de voz e transformá-las em um objeto JSON estruturado.
    
    Os dados do usuário são:
    - Plataformas: ${settings.platforms?.join(', ') || 'Uber, 99'}
    - Categorias de Receita: ${settings.incomeCategories?.join(', ') || 'Particular, Serviço'}
    - Categorias de Despesa: ${settings.expenseCategories?.join(', ') || 'Combustível, Manutenção'}
    - Preço do combustível atual: R$ ${settings.fuelPricePerLiter}

    Você deve retornar UM dos seguintes tipos de objetos JSON:

    1. TRIP (Corrida/Dia de trabalho):
       {
         "type": "trip",
         "data": {
           "earnings": number,
           "kmDriven": number,
           "carAutonomy": number (padrão 10 se não informado),
           "startTime": "HH:mm",
           "endTime": "HH:mm",
           "platform": "string" (deve ser uma das plataformas do usuário)
         }
       }

    2. REFUEL (Abastecimento):
       {
         "type": "refuel",
         "data": {
           "totalValue": number,
           "pricePerLiter": number (usar o padrão se não informado),
           "refuelType": "work" | "personal"
         }
       }

    3. TRANSACTION (Outras receitas ou despesas):
       {
         "type": "transaction",
         "data": {
           "transactionType": "income" | "expense",
           "amount": number,
           "description": "string",
           "category": "string" (usar uma das categorias do usuário se possível)
         }
       }

    Se você não entender ou as informações forem insuficientes, retorne:
    { "error": "Desculpe, não consegui entender as informações necessárias. Pode repetir?" }

    Responda APENAS com o JSON.
  `;

  try {
    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // O Lovable API Key é injetado automaticamente se usarmos o proxy ou se o usuário tiver configurado
        // Mas aqui usaremos a convenção do gateway
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error('Falha ao processar comando com IA');
    }

    const result = await response.json();
    return JSON.parse(result.choices[0].message.content);
  } catch (error) {
    console.error('Erro na IA:', error);
    return { error: 'Ocorreu um erro ao processar sua voz. Tente novamente.' };
  }
}

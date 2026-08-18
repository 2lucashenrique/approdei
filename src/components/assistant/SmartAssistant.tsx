
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mic, MicOff, Send, Loader2, Sparkles, X } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { sendMessageToAssistant } from '@/utils/aiAssistant';
import { toast } from '@/hooks/use-toast';

export const SmartAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isListening, startListening, stopListening, transcript } = useVoiceRecognition();

  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  const handleProcess = async (text: string) => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await sendMessageToAssistant(text);
      if (response.error) throw new Error(response.error);
      
      toast({
        title: "Processado com sucesso!",
        description: response.text,
      });
      setInputText('');
      setIsOpen(false);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao processar",
        description: "Não foi possível entender as informações. Tente ser mais claro.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        // Callback final se necessário
      });
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50 animate-bounce"
        size="icon"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-blue-100">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Assistente Inteligente
            </CardTitle>
            <CardDescription>
              Fale ou escreva tudo o que deseja registrar
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <textarea
              className="w-full min-h-[120px] p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50 text-sm"
              placeholder="Ex: 'Hoje fiz 200 reais na Uber em 15 corridas e rodei 120km' ou 'Abasteci 100 reais de gasolina a 5,50 por litro'"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            {isListening && (
              <div className="absolute top-2 right-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse [animation-delay:0.2s]" />
                  <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={isListening ? "destructive" : "outline"}
              className={`flex-1 gap-2 ${isListening ? 'animate-pulse' : ''}`}
              onClick={toggleListening}
              disabled={isLoading}
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4" /> Parar
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" /> Falar
                </>
              )}
            </Button>
            <Button
              className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => handleProcess(inputText)}
              disabled={isLoading || !inputText.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" /> Processar
                </>
              )}
            </Button>
          </div>
          
          <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
            Alimentado por Inteligência Artificial
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

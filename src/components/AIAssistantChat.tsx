import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Send, Bot, User, Loader2, X, MicOff } from 'lucide-react';
import { Message, sendMessageToAssistant } from '@/utils/aiAssistant';
import { toast } from '@/hooks/use-toast';

interface AIAssistantChatProps {
  onClose?: () => void;
}

const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou seu assistente de corridas. Como posso te ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await sendMessageToAssistant(text, messages);
      const assistantMessage: Message = { role: 'assistant', content: result.text };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no Assistente",
        description: "Não foi possível processar sua mensagem."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        variant: "destructive",
        title: "Recurso indisponível",
        description: "Seu navegador não suporta reconhecimento de voz."
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Opcional: enviar automaticamente
      // handleSend(transcript);
    };

    recognition.start();
  };

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-md shadow-2xl border-yellow-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-yellow-50 rounded-t-lg">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Bot className="text-yellow-600" size={24} />
          Assistente de Corrida
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-2 rounded-lg ${
                    m.role === 'user' 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-2 rounded-lg flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Processando...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 bg-gray-50 rounded-b-lg border-t">
        <div className="flex w-full items-center gap-2">
          <Button 
            variant={isListening ? "destructive" : "outline"} 
            size="icon" 
            onClick={isListening ? () => {} : startListening}
            className={isListening ? "animate-pulse" : ""}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>
          <Input 
            placeholder="Diga algo ou digite..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button size="icon" onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
            <Send size={20} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIAssistantChat;
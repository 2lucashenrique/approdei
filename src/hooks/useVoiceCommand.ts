import { useState, useEffect, useCallback, useRef } from 'react';
import { processVoiceCommand } from '@/utils/aiGateway';
import { Settings } from '@/types';

type Message = { role: 'user' | 'assistant'; content: string };

export function useVoiceCommand(settings: Settings) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiQuestion, setAiQuestion] = useState<string | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  
  const recognitionRef = useRef<any>(null);

  const sayText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any ongoing speech and recognition
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;
    
    // Get available voices and prefer a natural one if possible
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;
    
    utterance.onstart = () => {
      setIsListening(false);
    };

    utterance.onend = () => {
      // Delay before starting to listen again to avoid hearing itself
      setTimeout(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition && !isProcessing && !result) {
          try {
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;
            recognition.lang = 'pt-BR';
            recognition.continuous = false;
            recognition.interimResults = true;

            recognition.onstart = () => {
              setIsListening(true);
              setTranscript('');
              setError(null);
            };

            recognition.onresult = (event: any) => {
              const current = event.resultIndex;
              const transcriptText = event.results[current][0].transcript;
              setTranscript(transcriptText);
            };

            recognition.onerror = (event: any) => {
              console.error('Auto-restart recognition error:', event.error);
              setIsListening(false);
              // Only set error if it's not a silence/abort
              if (event.error !== 'no-speech' && event.error !== 'aborted') {
                setError('Tente falar novamente.');
              }
            };

            recognition.onend = () => {
              setIsListening(false);
            };

            recognition.start();
          } catch (e) {
            console.error('Failed to restart recognition', e);
          }
        }
      }, 300);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError('Erro no reconhecimento de voz. Tente novamente.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Use transcript ref or latest value
    };

    recognition.start();
  }, []);

  useEffect(() => {
    // Only process if we have a transcript AND we are not already processing or have a result
    if (!isListening && transcript.trim() !== '' && !isProcessing && !result) {
      handleProcess(transcript);
    }
  }, [isListening, transcript, isProcessing, result]);

  // Clean up any ongoing speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleProcess = async (text: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError(null); // Clear previous errors
    
    const newHistory: Message[] = [...history, { role: 'user', content: text }];
    setHistory(newHistory);
    
    try {
      const aiResponse = await processVoiceCommand(newHistory, settings);
      
      if (aiResponse.error) {
        setError(aiResponse.error);
        sayText(aiResponse.error);
        // Remove the failed user message from history to allow retry
        setHistory(history); 
      } else if (aiResponse.status === 'partial') {
        setAiQuestion(aiResponse.question);
        setHistory(prev => [...prev, { role: 'assistant', content: aiResponse.question }]);
        sayText(aiResponse.question);
      } else if (aiResponse.status === 'complete') {
        setResult(aiResponse);
        setAiQuestion(null);
        sayText('Entendido. Registro pronto para confirmar.');
      }
    } catch (err) {
      console.error('Critical voice process error:', err);
      setError('Falha na comunicação com o servidor.');
      sayText('Desculpe, tive um problema de conexão. Tente novamente.');
      setHistory(history);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setTranscript('');
    setResult(null);
    setError(null);
    setAiQuestion(null);
    setHistory([]);
    setIsProcessing(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return {
    isListening,
    transcript,
    isProcessing,
    result,
    error,
    aiQuestion,
    startListening,
    reset
  };
}

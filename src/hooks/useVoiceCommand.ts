import { useState, useEffect, useCallback } from 'react';
import { processVoiceCommand } from '@/utils/aiGateway';
import { Settings } from '@/types';

export function useVoiceCommand(settings: Settings) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
      setResult(null);
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      setError('Erro no reconhecimento de voz. Tente novamente.');
    };

    recognition.onend = async () => {
      setIsListening(false);
      if (transcript) {
        handleProcess(transcript);
      }
    };

    recognition.start();
  }, [transcript]);

  const handleProcess = async (text: string) => {
    setIsProcessing(true);
    try {
      const aiResponse = await processVoiceCommand(text, settings);
      if (aiResponse.error) {
        setError(aiResponse.error);
      } else {
        setResult(aiResponse);
      }
    } catch (err) {
      setError('Falha ao processar o comando.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setTranscript('');
    setResult(null);
    setError(null);
    setIsProcessing(false);
  };

  return {
    isListening,
    transcript,
    isProcessing,
    result,
    error,
    startListening,
    reset
  };
}

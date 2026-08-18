
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trip, Settings } from '@/types';
import { calculateFuelConsumed, calculateFuelCost, calculateNetProfit, calculateEarningsPerHour, calculateHoursWorked } from '@/utils/calculations';
import PlatformTripSelector from './PlatformTripSelector';
import { useAuth } from '@/hooks/useAuth';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { toast } from '@/hooks/use-toast';

interface TripFormProps {
  onSubmit: (trip: Trip) => void;
  settings: Settings;
}

const TripForm: React.FC<TripFormProps> = ({ onSubmit, settings }) => {
  const { user } = useAuth();
  const { isListening, startListening, speak } = useVoiceRecognition();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    kmDriven: '',
    carAutonomy: '',
    observations: '',
  });

  const [tripsByPlatform, setTripsByPlatform] = useState<{ [platform: string]: number }>({});
  const [earningsByPlatform, setEarningsByPlatform] = useState<{ [platform: string]: number }>({});

  const stateRef = useRef({ formData, tripsByPlatform, earningsByPlatform });
  stateRef.current = { formData, tripsByPlatform, earningsByPlatform };

  const handleVoiceButtonClick = () => {
    if (isListening) return;

    let currentStep = 0;
    const platforms = settings.platforms || [];
    let platformIndex = 0;
    
    // Steps: 
    // 0: startTime
    // 1: endTime
    // 2: Platform Loop (Ganhos -> Corridas)
    // 3: kmDriven
    // 4: carAutonomy
    // 5: Save Confirmation

    const processStep = (text: string) => {
      const lowerText = text.toLowerCase();
      const numberMatch = text.match(/(\d+[,.]?\d*)/);
      const number = numberMatch ? numberMatch[1].replace(',', '.') : null;

      if (currentStep === 0) { // Start Time
        const timeMatch = text.match(/(\d{1,2})[:h](\d{0,2})/);
        if (timeMatch) {
          const val = `${timeMatch[1].padStart(2, '0')}:${(timeMatch[2] || '00').padEnd(2, '0')}`;
          setFormData(prev => ({ ...prev, startTime: val }));
          currentStep = 1;
          askQuestion();
        } else if (number) {
          setFormData(prev => ({ ...prev, startTime: `${number.padStart(2, '0')}:00` }));
          currentStep = 1;
          askQuestion();
        } else {
          speak("Não entendi o horário. Pode repetir o horário de início?");
          setTimeout(() => startListening(processStep), 2000);
        }
      } 
      else if (currentStep === 1) { // End Time
        const timeMatch = text.match(/(\d{1,2})[:h](\d{0,2})/);
        if (timeMatch) {
          const val = `${timeMatch[1].padStart(2, '0')}:${(timeMatch[2] || '00').padEnd(2, '0')}`;
          setFormData(prev => ({ ...prev, endTime: val }));
          currentStep = 2;
          askQuestion();
        } else if (number) {
          setFormData(prev => ({ ...prev, endTime: `${number.padStart(2, '0')}:00` }));
          currentStep = 2;
          askQuestion();
        } else {
          speak("Não entendi o horário. Pode repetir o horário de término?");
          setTimeout(() => startListening(processStep), 2000);
        }
      }
      else if (currentStep === 2) { // Platform Earnings
        if (number) {
          const platform = platforms[platformIndex] || 'Geral';
          setEarningsByPlatform(prev => ({ ...prev, [platform]: parseFloat(number) }));
          currentStep = 3;
          askQuestion();
        } else {
          speak("Não entendi o valor. Quanto você ganhou?");
          setTimeout(() => startListening(processStep), 2000);
        }
      }
      else if (currentStep === 3) { // Platform Trips
        if (number) {
          const platform = platforms[platformIndex] || 'Geral';
          setTripsByPlatform(prev => ({ ...prev, [platform]: parseInt(number) }));
          
          if (platformIndex < platforms.length - 1) {
            platformIndex++;
            currentStep = 2; // Back to earnings for next platform
          } else {
            currentStep = 4; // Next to KM
          }
          askQuestion();
        } else {
          speak("Não entendi a quantidade. Quantas corridas você fez?");
          setTimeout(() => startListening(processStep), 2000);
        }
      }
      else if (currentStep === 4) { // KM Driven
        if (number) {
          setFormData(prev => ({ ...prev, kmDriven: number }));
          currentStep = 5;
          askQuestion();
        } else {
          speak("Não entendi a quilometragem. Quantos quilômetros você rodou?");
          setTimeout(() => startListening(processStep), 2000);
        }
      }
      else if (currentStep === 5) { // Autonomy
        if (number) {
          setFormData(prev => ({ ...prev, carAutonomy: number }));
          currentStep = 6;
          askQuestion();
        } else {
          speak("Não entendi a autonomia. Qual a autonomia do carro?");
          setTimeout(() => startListening(processStep), 2000);
        }
      }
      else if (currentStep === 6) { // Save Confirmation
        if (lowerText.includes('sim') || lowerText.includes('salvar') || lowerText.includes('pode')) {
          speak("Salvando corrida.");
          // We need to trigger submit manually or call it
          document.getElementById('trip-submit-btn')?.click();
        } else {
          speak("Entendido. Você pode revisar os dados e salvar manualmente.");
        }
      }
    };

    const askQuestion = () => {
      let prompt = "";
      if (currentStep === 0) prompt = "Qual o horário de início?";
      else if (currentStep === 1) prompt = "Qual o horário de término?";
      else if (currentStep === 2) prompt = `Quanto você ganhou na ${platforms[platformIndex] || 'plataforma'}?`;
      else if (currentStep === 3) prompt = `Quantas corridas você fez na ${platforms[platformIndex] || 'plataforma'}?`;
      else if (currentStep === 4) prompt = "Quantos quilômetros foram rodados?";
      else if (currentStep === 5) prompt = "Qual a autonomia do carro?";
      else if (currentStep === 6) prompt = "Deseja salvar a corrida?";

      speak(prompt, () => {
        startListening(processStep);
      });
    };

    askQuestion();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    const totalEarnings = Object.values(earningsByPlatform).reduce((sum, earnings) => sum + earnings, 0);
    const kmDriven = parseFloat(formData.kmDriven);
    const carAutonomy = parseFloat(formData.carAutonomy);
    const hoursWorked = calculateHoursWorked(formData.startTime, formData.endTime);
    const fuelConsumed = calculateFuelConsumed(kmDriven, carAutonomy);
    const fuelCost = calculateFuelCost(fuelConsumed, settings.fuelPricePerLiter);
    const netProfit = calculateNetProfit(totalEarnings, fuelCost);
    const earningsPerHour = calculateEarningsPerHour(netProfit, hoursWorked);

    const totalTrips = Object.values(tripsByPlatform).reduce((sum, count) => sum + count, 0);

    const trip: Omit<Trip, 'id' | 'userId'> = {
      date: formData.date,
      earnings: totalEarnings,
      startTime: formData.startTime,
      endTime: formData.endTime,
      tripCount: totalTrips,
      tripsByPlatform: tripsByPlatform,
      earningsByPlatform: earningsByPlatform,
      kmDriven,
      carAutonomy,
      fuelConsumed,
      fuelCost,
      netProfit,
      earningsPerHour,
      observations: formData.observations,
    };

    onSubmit(trip as Trip);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      kmDriven: '',
      carAutonomy: '',
      observations: '',
    });
    setTripsByPlatform({});
    setEarningsByPlatform({});
    
    toast({
      title: "Corrida adicionada!",
      description: "Os dados foram salvos com sucesso.",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Nova Corrida</CardTitle>
        <Button 
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="sm"
          onClick={handleVoiceButtonClick}
          className={`flex items-center gap-2 ${isListening ? 'animate-pulse' : ''}`}
        >
          <Mic size={16} />
          {isListening ? 'Ouvindo...' : 'Preencher por Voz'}
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Hora de Início</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">Hora de Término</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                required
              />
            </div>
          </div>

          <PlatformTripSelector
            platforms={settings.platforms || []}
            tripsByPlatform={tripsByPlatform}
            earningsByPlatform={earningsByPlatform}
            onChange={setTripsByPlatform}
            onEarningsChange={setEarningsByPlatform}
          />

          <div>
            <Label htmlFor="kmDriven">Quilometragem Rodada (km)</Label>
            <Input
              id="kmDriven"
              type="number"
              step="0.1"
              placeholder="0,0"
              value={formData.kmDriven}
              onChange={(e) => handleChange('kmDriven', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="carAutonomy">Autonomia do Carro (km/L)</Label>
            <Input
              id="carAutonomy"
              type="number"
              step="0.1"
              placeholder="0,0"
              value={formData.carAutonomy}
              onChange={(e) => handleChange('carAutonomy', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              placeholder="Observações sobre a corrida..."
              value={formData.observations}
              onChange={(e) => handleChange('observations', e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" id="trip-submit-btn" className="w-full">
            Adicionar Corrida
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TripForm;

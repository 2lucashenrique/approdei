
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trip, Settings } from '@/types';
import { calculateFuelConsumed, calculateFuelCost, calculateNetProfit, calculateEarningsPerHour, calculateHoursWorked } from '@/utils/calculations';
import PlatformTripSelector from './PlatformTripSelector';
import { useAuth } from '@/hooks/useAuth';
import { Mic, MicOff, Wand2 } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { toast } from '@/hooks/use-toast';

interface TripFormProps {
  onSubmit: (trip: Trip) => void;
  settings: Settings;
}

const TripForm: React.FC<TripFormProps> = ({ onSubmit, settings }) => {
  const { user } = useAuth();
  const { isListening, startListening } = useVoiceRecognition();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    kmDriven: settings.carAutonomy ? '' : '', // Placeholder to keep structure
    carAutonomy: settings.carAutonomy?.toString() || '',
    observations: '',
  });

  const [tripsByPlatform, setTripsByPlatform] = useState<{ [platform: string]: number }>({});
  const [earningsByPlatform, setEarningsByPlatform] = useState<{ [platform: string]: number }>({});

  const parseVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    console.log("Processando comando de voz:", lowerText);

    // Regex patterns
    const moneyPattern = /(\d+[\d\s,.]*)\s*(reais|real|R\$)/g;
    const numberPattern = /(\d+[\d\s,.]*)/g;
    const timePattern = /(\d{1,2})[:h](\d{0,2})/g;

    // Detect platforms
    const detectedPlatforms: { [key: string]: number } = {};
    const detectedEarnings: { [key: string]: number } = {};
    
    if (settings.platforms) {
      settings.platforms.forEach(p => {
        const pLower = p.toLowerCase();
        if (lowerText.includes(pLower)) {
          // Look for amount near platform name
          const index = lowerText.indexOf(pLower);
          const subText = lowerText.substring(index, index + 30);
          const match = subText.match(/(\d+[,.]?\d*)/);
          if (match) {
            detectedEarnings[p] = parseFloat(match[1].replace(',', '.'));
            detectedPlatforms[p] = 1; // Default to 1 trip if not specified
          }
        }
      });
    }

    // Fallback if no specific platform earnings found but generic "X reais" exists
    if (Object.keys(detectedEarnings).length === 0) {
      const moneyMatch = [...lowerText.matchAll(moneyPattern)];
      if (moneyMatch.length > 0) {
        const amount = parseFloat(moneyMatch[0][1].replace(',', '.').replace(/\s/g, ''));
        if (settings.platforms && settings.platforms.length > 0) {
          detectedEarnings[settings.platforms[0]] = amount;
          detectedPlatforms[settings.platforms[0]] = 1;
        } else {
          detectedEarnings['Geral'] = amount;
          detectedPlatforms['Geral'] = 1;
        }
      }
    }

    // Detect KM and Autonomy
    let km = formData.kmDriven;
    if (lowerText.includes('km') || lowerText.includes('quilômetros')) {
      const match = lowerText.match(/(\d+[,.]?\d*)\s*(km|quilômetros)/);
      if (match) km = match[1].replace(',', '.');
    }

    // Detect Times
    let start = formData.startTime;
    let end = formData.endTime;
    const times = [...lowerText.matchAll(timePattern)];
    if (times.length >= 2) {
      start = `${times[0][1].padStart(2, '0')}:${(times[0][2] || '00').padEnd(2, '0')}`;
      end = `${times[1][1].padStart(2, '0')}:${(times[1][2] || '00').padEnd(2, '0')}`;
    }

    // Apply changes
    if (Object.keys(detectedEarnings).length > 0) {
      setEarningsByPlatform(prev => ({ ...prev, ...detectedEarnings }));
      setTripsByPlatform(prev => ({ ...prev, ...detectedPlatforms }));
    }
    
    setFormData(prev => ({
      ...prev,
      kmDriven: km,
      startTime: start,
      endTime: end
    }));

    toast({
      title: "Voz processada",
      description: "Campos preenchidos com base na sua fala.",
    });
  };

  const handleVoiceButtonClick = () => {
    startListening(parseVoiceCommand);
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
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
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

          <Button type="submit" className="w-full">
            Adicionar Corrida
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TripForm;

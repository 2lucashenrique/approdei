
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Mic, MicOff } from 'lucide-react';
import { Refuel, Settings } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

interface AddRefuelPageProps {
  settings: Settings;
  onAddRefuel: (refuel: Omit<Refuel, 'id' | 'userId'>) => void;
  onSettingsUpdate: (settings: Settings) => void;
}

const AddRefuelPage: React.FC<AddRefuelPageProps> = ({ 
  settings,
  onAddRefuel,
  onSettingsUpdate 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isListening, startListening } = useVoiceRecognition();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    totalValue: '',
    pricePerLiter: settings.fuelPricePerLiter.toString(),
    type: 'work' as 'work' | 'personal',
  });

  const parseVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    const moneyPattern = /(\d+[\d\s,.]*)\s*(reais|real|R\$)/g;
    
    let amount = formData.totalValue;
    let price = formData.pricePerLiter;
    let type = formData.type;

    const moneyMatches = [...lowerText.matchAll(moneyPattern)];
    if (moneyMatches.length >= 1) {
      amount = moneyMatches[0][1].replace(',', '.').replace(/\s/g, '');
      if (moneyMatches.length >= 2) {
        price = moneyMatches[1][1].replace(',', '.').replace(/\s/g, '');
      }
    } else {
      const numbers = lowerText.match(/(\d+[,.]?\d*)/g);
      if (numbers && numbers.length >= 1) {
        amount = numbers[0].replace(',', '.');
        if (numbers.length >= 2) {
          price = numbers[1].replace(',', '.');
        }
      }
    }

    if (lowerText.includes('pessoal') || lowerText.includes('casa')) {
      type = 'personal';
    } else if (lowerText.includes('trabalho') || lowerText.includes('uber') || lowerText.includes('trampo')) {
      type = 'work';
    }

    setFormData(prev => ({
      ...prev,
      totalValue: amount,
      pricePerLiter: price,
      type: type
    }));

    toast({
      title: "Voz processada",
      description: "Dados de abastecimento preenchidos.",
    });
  };

  const handleVoiceButtonClick = () => {
    startListening(parseVoiceCommand);
  };

  // Update pricePerLiter when settings change
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      pricePerLiter: settings.fuelPricePerLiter.toString()
    }));
  }, [settings.fuelPricePerLiter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    const totalValue = parseFloat(formData.totalValue.replace(',', '.'));
    const pricePerLiter = parseFloat(formData.pricePerLiter.replace(',', '.'));
    const liters = totalValue / pricePerLiter;

    // Update settings if price per liter changed
    if (pricePerLiter !== settings.fuelPricePerLiter) {
      onSettingsUpdate({ ...settings, fuelPricePerLiter: pricePerLiter });
    }

    // Ensure expense categories include fuel categories
    const currentExpenseCategories = settings.expenseCategories || [];
    const fuelCategories = ['Abastecimento Trabalho', 'Abastecimento Pessoal'];
    const missingCategories = fuelCategories.filter(cat => !currentExpenseCategories.includes(cat));
    
    if (missingCategories.length > 0) {
      onSettingsUpdate({ 
        ...settings, 
        expenseCategories: [...currentExpenseCategories, ...missingCategories] 
      });
    }

    const refuel: Omit<Refuel, 'id' | 'userId'> = {
      date: formData.date,
      totalValue,
      liters,
      pricePerLiter,
      type: formData.type,
    };

    onAddRefuel(refuel);
    
    toast({
      title: "Abastecimento adicionado!",
      description: `Abastecimento ${formData.type === 'work' ? 'de trabalho' : 'pessoal'} de R$ ${totalValue.toFixed(2)} foi registrado.`,
    });

    // Voltar para a página de combustível
    navigate('/?tab=refuel');
  };

  const handleCancel = () => {
    navigate('/?tab=refuel');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatedLiters = formData.totalValue && formData.pricePerLiter
    ? (parseFloat(formData.totalValue) / parseFloat(formData.pricePerLiter)).toFixed(2)
    : '0,00';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Novo Abastecimento" />

      <div className="p-4">
        {/* Header com botão voltar */}
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleCancel}
            className="h-10 w-10"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">Adicionar Abastecimento</h1>
        </div>

        {/* Formulário */}
        <Card className="max-w-md mx-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Novo Abastecimento</CardTitle>
            <Button 
              type="button"
              variant={isListening ? "destructive" : "outline"}
              size="sm"
              onClick={handleVoiceButtonClick}
              className={`flex items-center gap-2 ${isListening ? 'animate-pulse' : ''}`}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              {isListening ? 'Ouvindo...' : 'Por Voz'}
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

              <div>
                <Label className="text-sm font-medium">Tipo de Abastecimento</Label>
                <RadioGroup 
                  value={formData.type} 
                  onValueChange={(value: 'work' | 'personal') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="work" id="work" />
                    <Label htmlFor="work" className="cursor-pointer">Trabalho</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="personal" id="personal" />
                    <Label htmlFor="personal" className="cursor-pointer">Pessoal</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="totalValue">Valor Total Abastecido (R$)</Label>
                <Input
                  id="totalValue"
                  type="number"
                  step="any"
                  placeholder="0,00"
                  value={formData.totalValue}
                  onChange={(e) => handleChange('totalValue', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="pricePerLiter">Valor por Litro (R$)</Label>
                <Input
                  id="pricePerLiter"
                  type="number"
                  step="any"
                  placeholder="0,000"
                  value={formData.pricePerLiter}
                  onChange={(e) => handleChange('pricePerLiter', e.target.value)}
                  required
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-700">
                  Quantidade de Litros (calculado)
                </Label>
                <p className="text-lg font-semibold text-blue-600">
                  {calculatedLiters} L
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Adicionar Abastecimento
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddRefuelPage;

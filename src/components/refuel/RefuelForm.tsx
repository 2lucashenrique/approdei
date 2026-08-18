
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Refuel, Settings } from '@/types';
import { formatNumber } from '@/utils/calculations';
import { useAuth } from '@/hooks/useAuth';

import { toast } from '@/hooks/use-toast';

interface RefuelFormProps {
  onSubmit: (refuel: Refuel) => void;
  settings: Settings;
  onSettingsUpdate: (settings: Settings) => void;
}

const RefuelForm: React.FC<RefuelFormProps> = ({ onSubmit, settings, onSettingsUpdate }) => {
  const { user } = useAuth();
  const [isListening] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    totalValue: '',
    pricePerLiter: settings.fuelPricePerLiter.toString(),
    type: 'work' as 'work' | 'personal',
  });

  const handleVoiceButtonClick = () => {
    toast({
      title: "Assistente Inteligente",
      description: "Use o botão mágico azul no canto inferior da tela para preencher por voz.",
    });
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
    const liters = Number((totalValue / pricePerLiter).toFixed(4));

    if (pricePerLiter !== settings.fuelPricePerLiter) {
      onSettingsUpdate({ ...settings, fuelPricePerLiter: pricePerLiter });
    }

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

    onSubmit(refuel as Refuel);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      totalValue: '',
      pricePerLiter: pricePerLiter.toString(),
      type: 'work',
    });
    
    toast({
      title: "Abastecimento adicionado!",
      description: "Os dados foram salvos com sucesso.",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatedLiters = formData.totalValue && formData.pricePerLiter
    ? formatNumber(parseFloat(formData.totalValue.replace(',', '.')) / parseFloat(formData.pricePerLiter.replace(',', '.')), 2)
    : '0,00';

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Novo Abastecimento</CardTitle>
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
              step="0.01"
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
              step="0.001"
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

          <Button type="submit" id="refuel-submit-btn" className="w-full">
            Adicionar Abastecimento
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RefuelForm;

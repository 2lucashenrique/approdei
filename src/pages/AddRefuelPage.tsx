
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft } from 'lucide-react';
import { Refuel, Settings } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';

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

    if (pricePerLiter !== settings.fuelPricePerLiter) {
      onSettingsUpdate({ ...settings, fuelPricePerLiter: pricePerLiter });
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
      description: "Os dados foram salvos com sucesso.",
    });
    navigate('/?tab=refuel');
  };

  const handleCancel = () => navigate('/?tab=refuel');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatedLiters = formData.totalValue && formData.pricePerLiter
    ? (parseFloat(formData.totalValue.replace(',', '.')) / parseFloat(formData.pricePerLiter.replace(',', '.'))).toFixed(2)
    : '0,00';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Novo Abastecimento" />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={handleCancel} className="h-10 w-10">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">Adicionar Abastecimento</h1>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Novo Abastecimento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} required />
              </div>

              <div>
                <Label className="text-sm font-medium">Tipo de Abastecimento</Label>
                <RadioGroup value={formData.type} onValueChange={(value: 'work' | 'personal') => setFormData(prev => ({ ...prev, type: value }))} className="flex gap-6 mt-2">
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
                <Input id="totalValue" type="number" step="any" placeholder="0,00" value={formData.totalValue} onChange={(e) => handleChange('totalValue', e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="pricePerLiter">Valor por Litro (R$)</Label>
                <Input id="pricePerLiter" type="number" step="any" placeholder="0,000" value={formData.pricePerLiter} onChange={(e) => handleChange('pricePerLiter', e.target.value)} required />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-700">Quantidade de Litros (calculado)</Label>
                <p className="text-lg font-semibold text-blue-600">{calculatedLiters} L</p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" id="refuel-submit-btn-page" className="flex-1">Adicionar Abastecimento</Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddRefuelPage;

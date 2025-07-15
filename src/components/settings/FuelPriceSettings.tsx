
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Fuel, ArrowLeft } from 'lucide-react';
import { Settings as SettingsType } from '@/types';
import { formatCurrency } from '@/utils/calculations';

interface FuelPriceSettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: SettingsType) => void;
  onBack: () => void;
}

const FuelPriceSettings: React.FC<FuelPriceSettingsProps> = ({ settings, onUpdateSettings, onBack }) => {
  const [fuelPrice, setFuelPrice] = useState(settings.fuelPricePerLiter.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPrice = parseFloat(fuelPrice);
    if (newPrice > 0) {
      onUpdateSettings({ 
        ...settings, 
        fuelPricePerLiter: newPrice
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold">Preço do Combustível</h2>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fuelPrice" className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-orange-500" />
                Preço do Combustível por Litro (R$)
              </Label>
              <Input
                id="fuelPrice"
                type="number"
                step="0.001"
                placeholder="0,000"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(e.target.value)}
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                Este valor será usado nos cálculos automáticos de combustível
              </p>
            </div>

            <Button type="submit" className="w-full">
              Salvar Preço
            </Button>
          </form>

          <div className="mt-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <Fuel className="w-4 h-4" />
                Preço Atual: {formatCurrency(settings.fuelPricePerLiter)}/L
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuelPriceSettings;


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Refuel } from '@/types';

interface RefuelEditDialogProps {
  refuel: Refuel;
  onSave: (refuel: Refuel) => void;
  onCancel: () => void;
}

const RefuelEditDialog: React.FC<RefuelEditDialogProps> = ({ refuel, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    date: refuel.date,
    totalValue: refuel.totalValue.toString(),
    pricePerLiter: refuel.pricePerLiter.toString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalValue = parseFloat(formData.totalValue);
    const pricePerLiter = parseFloat(formData.pricePerLiter);
    const liters = totalValue / pricePerLiter;

    const updatedRefuel: Refuel = {
      ...refuel,
      date: formData.date,
      totalValue,
      pricePerLiter,
      liters,
    };

    onSave(updatedRefuel);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatedLiters = formData.totalValue && formData.pricePerLiter
    ? (parseFloat(formData.totalValue) / parseFloat(formData.pricePerLiter)).toFixed(2)
    : '0,00';

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Abastecimento</DialogTitle>
        </DialogHeader>
        
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
            <Label htmlFor="totalValue">Valor Total Abastecido (R$)</Label>
            <Input
              id="totalValue"
              type="number"
              step="0.01"
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

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RefuelEditDialog;

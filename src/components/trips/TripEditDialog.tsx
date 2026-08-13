
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trip } from '@/types';

interface TripEditDialogProps {
  trip: Trip;
  onSave: (trip: Trip) => void;
  onCancel: () => void;
}

const TripEditDialog: React.FC<TripEditDialogProps> = ({ trip, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    date: trip.date,
    earnings: trip.earnings.toString(),
    startTime: trip.startTime,
    endTime: trip.endTime,
    tripCount: trip.tripCount.toString(),
    kmDriven: trip.kmDriven.toString(),
    carAutonomy: trip.carAutonomy.toString(),
    observations: trip.observations || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedTrip: Trip = {
      ...trip,
      date: formData.date,
      earnings: parseFloat(formData.earnings),
      startTime: formData.startTime,
      endTime: formData.endTime,
      tripCount: parseInt(formData.tripCount),
      kmDriven: parseFloat(formData.kmDriven),
      carAutonomy: parseFloat(formData.carAutonomy),
      observations: formData.observations,
      // Recalcular valores derivados seria necessário aqui
      fuelConsumed: parseFloat(formData.kmDriven) / parseFloat(formData.carAutonomy),
      fuelCost: (parseFloat(formData.kmDriven) / parseFloat(formData.carAutonomy)) * 5.50, // usar preço do settings
      netProfit: parseFloat(formData.earnings) - ((parseFloat(formData.kmDriven) / parseFloat(formData.carAutonomy)) * 5.50),
      earningsPerHour: 0, // seria necessário recalcular
    };

    onSave(updatedTrip);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Corrida</DialogTitle>
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
            <Label htmlFor="earnings">Ganhos (R$)</Label>
            <Input
              id="earnings"
              type="number"
              step="any"
              value={formData.earnings}
              onChange={(e) => handleChange('earnings', e.target.value)}
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

          <div>
            <Label htmlFor="tripCount">Quantidade de Corridas</Label>
            <Input
              id="tripCount"
              type="number"
              step="any"
              value={formData.tripCount}
              onChange={(e) => handleChange('tripCount', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="kmDriven">Quilometragem Rodada (km)</Label>
            <Input
              id="kmDriven"
              type="number"
              step="any"
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
              step="any"
              value={formData.carAutonomy}
              onChange={(e) => handleChange('carAutonomy', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => handleChange('observations', e.target.value)}
              rows={3}
            />
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

export default TripEditDialog;

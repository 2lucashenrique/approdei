
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

interface TripFormProps {
  onSubmit: (trip: Trip) => void;
  settings: Settings;
}

const TripForm: React.FC<TripFormProps> = ({ onSubmit, settings }) => {
  const { user } = useAuth();
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

    const trip: Trip = {
      id: Date.now().toString(),
      userId: user.id,
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

    onSubmit(trip);
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
      <CardHeader>
        <CardTitle className="text-lg">Nova Corrida</CardTitle>
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

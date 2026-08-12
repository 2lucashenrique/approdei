
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trip, Settings } from '@/types';
import { formatCurrency } from '@/utils/calculations';
import { Target, TrendingUp, Clock, Car } from 'lucide-react';

interface WeeklySummaryProps {
  trips: Trip[];
  settings: Settings;
}

const WeeklySummary: React.FC<WeeklySummaryProps> = ({ trips, settings }) => {
  const currentWeek = new Date();
  const weekStart = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay()));
  
  const weekTrips = trips.filter(trip => {
    const tripDate = new Date(trip.date + 'T12:00:00');
    return tripDate >= weekStart;
  });

  const weeklyEarnings = weekTrips.reduce((sum, trip) => sum + trip.earnings, 0);
  const weeklyTripsCount = weekTrips.reduce((sum, trip) => sum + trip.tripCount, 0);
  const weeklyHours = weekTrips.reduce((sum, trip) => {
    const start = new Date(`2000-01-01T${trip.startTime}`);
    const end = new Date(`2000-01-01T${trip.endTime}`);
    if (end < start) end.setDate(end.getDate() + 1);
    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);

  const goalProgress = settings.weeklyGoal ? (weeklyEarnings / settings.weeklyGoal) * 100 : 0;
  const averagePerHour = weeklyHours > 0 ? weeklyEarnings / weeklyHours : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="text-primary" size={20} />
          Resumo da Semana
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {settings.weeklyGoal && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Meta Semanal</span>
              <span className="text-sm text-gray-600">
                {formatCurrency(weeklyEarnings)} / {formatCurrency(settings.weeklyGoal)}
              </span>
            </div>
            <Progress value={Math.min(goalProgress, 100)} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              {goalProgress >= 100 ? '🎉 Meta atingida!' : `${(100 - goalProgress).toFixed(0)}% restante`}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="text-green-600" size={16} />
            </div>
            <p className="text-lg font-semibold">{formatCurrency(weeklyEarnings)}</p>
            <p className="text-xs text-gray-500">Ganhos</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Car className="text-primary" size={16} />
            </div>
            <p className="text-lg font-semibold">{weeklyTripsCount}</p>
            <p className="text-xs text-gray-500">Corridas</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="text-purple-600" size={16} />
            </div>
            <p className="text-lg font-semibold">{weeklyHours.toFixed(1)}h</p>
            <p className="text-xs text-gray-500">Horas</p>
          </div>
        </div>

        {averagePerHour > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-center">
              Média: {formatCurrency(averagePerHour)}/hora
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklySummary;


import React from 'react';
import DashboardWidget from '@/components/dashboard/DashboardWidget';
import { Trip } from '@/types';
import { formatCurrency, formatNumber } from '@/utils/calculations';
import { 
  DollarSign, 
  Fuel, 
  TrendingUp, 
  Clock, 
  Car, 
  Gauge, 
  Navigation,
  Calculator,
  Calendar,
  Timer
} from 'lucide-react';

interface TripMetricsDashboardProps {
  trips: Trip[];
}

const TripMetricsDashboard: React.FC<TripMetricsDashboardProps> = ({ trips }) => {
  // Calcular métricas
  const totalEarnings = trips.reduce((sum, trip) => sum + trip.earnings, 0);
  const totalFuelCost = trips.reduce((sum, trip) => sum + trip.fuelCost, 0);
  const totalNetProfit = trips.reduce((sum, trip) => sum + trip.netProfit, 0);
  const totalTrips = trips.reduce((sum, trip) => sum + trip.tripCount, 0);
  const totalKm = trips.reduce((sum, trip) => sum + trip.kmDriven, 0);
  const totalFuelLiters = trips.reduce((sum, trip) => sum + trip.fuelConsumed, 0);
  const totalHours = trips.reduce((sum, trip) => sum + (trip.earningsPerHour > 0 ? trip.netProfit / trip.earningsPerHour : 0), 0);
  
  // Dias trabalhados (dias únicos)
  const uniqueDates = new Set(trips.map(trip => trip.date));
  const daysWorked = uniqueDates.size;
  
  // Médias
  const averageAutonomy = trips.length > 0 ? trips.reduce((sum, trip) => sum + trip.carAutonomy, 0) / trips.length : 0;
  const earningsPerHour = totalHours > 0 ? totalNetProfit / totalHours : 0;
  const earningsPerKm = totalKm > 0 ? totalEarnings / totalKm : 0;
  const earningsPerTrip = totalTrips > 0 ? totalEarnings / totalTrips : 0;

  const metrics = [
    {
      title: 'Faturamento Total',
      value: formatCurrency(totalEarnings),
      icon: DollarSign,
      color: 'green' as const
    },
    {
      title: 'Gasto Combustível',
      value: formatCurrency(totalFuelCost),
      icon: Fuel,
      color: 'red' as const
    },
    {
      title: 'Lucro Líquido',
      value: formatCurrency(totalNetProfit),
      icon: TrendingUp,
      color: 'blue' as const
    },
    {
      title: 'R$ por Hora',
      value: formatCurrency(earningsPerHour),
      icon: Clock,
      color: 'purple' as const
    },
    {
      title: 'Total de Corridas',
      value: totalTrips.toString(),
      icon: Car,
      color: 'green' as const
    },
    {
      title: 'Total de KM',
      value: formatNumber(totalKm, 1) + ' km',
      icon: Navigation,
      color: 'blue' as const
    },
    {
      title: 'Total de Litros',
      value: formatNumber(totalFuelLiters, 1) + ' L',
      icon: Fuel,
      color: 'yellow' as const
    },
    {
      title: 'Média Autonomia',
      value: formatNumber(averageAutonomy, 1) + ' km/L',
      icon: Gauge,
      color: 'green' as const
    },
    {
      title: 'R$ por KM',
      value: formatCurrency(earningsPerKm),
      icon: Calculator,
      color: 'purple' as const
    },
    {
      title: 'R$ por Corrida',
      value: formatCurrency(earningsPerTrip),
      icon: Calculator,
      color: 'blue' as const
    },
    {
      title: 'Dias Trabalhados',
      value: daysWorked.toString(),
      icon: Calendar,
      color: 'green' as const
    },
    {
      title: 'Horas Trabalhadas',
      value: formatNumber(totalHours, 1) + 'h',
      icon: Timer,
      color: 'blue' as const
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <DashboardWidget
          key={index}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          color={metric.color}
        />
      ))}
    </div>
  );
};

export default TripMetricsDashboard;

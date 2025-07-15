
import React from 'react';
import { Trip, Refuel, Transaction, Settings } from '@/types';
import DashboardWidget from '@/components/dashboard/DashboardWidget';
import WeeklySummary from '@/components/dashboard/WeeklySummary';
import { formatCurrency, formatNumber } from '@/utils/calculations';
import { 
  DollarSign, 
  Car, 
  Fuel, 
  TrendingUp, 
  Clock, 
  Target,
  Calendar,
  MapPin
} from 'lucide-react';

interface DashboardPageProps {
  trips: Trip[];
  refuels: Refuel[];
  transactions: Transaction[];
  settings: Settings;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  trips,
  refuels,
  transactions,
  settings
}) => {
  // Cálculos gerais
  const totalEarnings = trips.reduce((sum, trip) => sum + trip.earnings, 0);
  const totalTrips = trips.reduce((sum, trip) => sum + trip.tripCount, 0);
  const totalKm = trips.reduce((sum, trip) => sum + trip.kmDriven, 0);
  const totalFuelCost = refuels.reduce((sum, refuel) => sum + refuel.totalValue, 0);
  const totalFuelLiters = refuels.reduce((sum, refuel) => sum + refuel.liters, 0);

  // Cálculos do mês atual
  const currentMonth = new Date();
  currentMonth.setDate(1);
  
  const monthTrips = trips.filter(trip => new Date(trip.date) >= currentMonth);
  const monthEarnings = monthTrips.reduce((sum, trip) => sum + trip.earnings, 0);
  const monthTripsCount = monthTrips.reduce((sum, trip) => sum + trip.tripCount, 0);

  // Últimos 7 dias
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentTrips = trips.filter(trip => new Date(trip.date) >= weekAgo);
  const recentEarnings = recentTrips.reduce((sum, trip) => sum + trip.earnings, 0);

  // Média de ganhos por corrida
  const avgEarningsPerTrip = totalTrips > 0 ? totalEarnings / totalTrips : 0;
  
  // Consumo médio
  const avgConsumption = totalKm > 0 && totalFuelLiters > 0 ? totalKm / totalFuelLiters : 0;

  // Horas trabalhadas no mês
  const monthHours = monthTrips.reduce((sum, trip) => {
    const start = new Date(`2000-01-01T${trip.startTime}`);
    const end = new Date(`2000-01-01T${trip.endTime}`);
    if (end < start) end.setDate(end.getDate() + 1);
    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Visão geral do seu desempenho como motorista</p>
      </div>

      {/* Resumo Semanal */}
      <WeeklySummary trips={trips} settings={settings} />

      {/* Widgets principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardWidget
          title="Ganhos do Mês"
          value={formatCurrency(monthEarnings)}
          icon={DollarSign}
          color="green"
          subtitle={`${monthTripsCount} corridas`}
        />
        <DashboardWidget
          title="Corridas Hoje"
          value={monthTripsCount.toString()}
          icon={Car}
          color="blue"
          subtitle="Este mês"
        />
        <DashboardWidget
          title="Gasto Combustível"
          value={formatCurrency(totalFuelCost)}
          icon={Fuel}
          color="red"
          subtitle={`${formatNumber(totalFuelLiters)} litros`}
        />
        <DashboardWidget
          title="Média/Corrida"
          value={formatCurrency(avgEarningsPerTrip)}
          icon={TrendingUp}
          color="purple"
          subtitle="Ganho médio"
        />
      </div>

      {/* Widgets secundários */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <DashboardWidget
          title="Horas do Mês"
          value={`${monthHours.toFixed(1)}h`}
          icon={Clock}
          color="blue"
          subtitle={monthHours > 0 ? `${formatCurrency(monthEarnings / monthHours)}/h` : 'N/A'}
        />
        <DashboardWidget
          title="KM Rodados"
          value={`${formatNumber(totalKm)} km`}
          icon={MapPin}
          color="yellow"
          subtitle="Total"
        />
        <DashboardWidget
          title="Consumo Médio"
          value={avgConsumption > 0 ? `${formatNumber(avgConsumption)} km/L` : 'N/A'}
          icon={Fuel}
          color="green"
          subtitle="Autonomia"
        />
      </div>

      {/* Estatísticas rápidas */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" />
          Estatísticas Gerais
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{trips.length}</p>
            <p className="text-sm text-gray-600">Dias trabalhados</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{totalTrips}</p>
            <p className="text-sm text-gray-600">Total de corridas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalEarnings)}</p>
            <p className="text-sm text-gray-600">Ganhos totais</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{refuels.length}</p>
            <p className="text-sm text-gray-600">Abastecimentos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

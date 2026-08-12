import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trip, Refuel, Transaction, Settings } from '@/types';
import { formatCurrency, formatNumber } from '@/utils/calculations';
import { 
  Car, 
  Fuel, 
  DollarSign, 
  Plus, 
  TrendingUp, 
  Clock, 
  Target,
  MapPin,
  BarChart3,
  ArrowRight,
  Calendar,
  Gauge,
  Tag
} from 'lucide-react';

interface HomePageProps {
  trips: Trip[];
  refuels: Refuel[];
  transactions: Transaction[];
  settings: Settings;
}

const HomePage: React.FC<HomePageProps> = ({
  trips,
  refuels,
  transactions,
  settings
}) => {
  const navigate = useNavigate();

  // Cálculos principais
  const totalEarnings = trips.reduce((sum, trip) => sum + trip.earnings, 0);
  const totalTrips = trips.reduce((sum, trip) => sum + trip.tripCount, 0);
  const totalKm = trips.reduce((sum, trip) => sum + trip.kmDriven, 0);
  const totalFuelCost = refuels.reduce((sum, refuel) => sum + refuel.totalValue, 0);

  // Dados do mês atual
  const currentMonth = new Date();
  currentMonth.setDate(1);
  const monthTrips = trips.filter(trip => new Date(trip.date + 'T12:00:00') >= currentMonth);
  const monthEarnings = monthTrips.reduce((sum, trip) => sum + trip.earnings, 0);

  // Semana atual
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekEarnings = trips
    .filter(trip => new Date(trip.date + 'T12:00:00') >= weekAgo)
    .reduce((sum, trip) => sum + trip.earnings, 0);

  // Meta semanal
  const weeklyProgress = settings.weeklyGoal ? (weekEarnings / settings.weeklyGoal) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Meta Semanal */}
      {settings.weeklyGoal && (
        <Card className="bg-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary-foreground">
              <Target className="text-primary-foreground" size={20} />
              Meta da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-primary-foreground">Progresso</span>
                <span className="text-sm text-primary-foreground/70">
                  {formatCurrency(weekEarnings)} / {formatCurrency(settings.weeklyGoal)}
                </span>
              </div>
              <div className="w-full bg-primary-foreground/20 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    weeklyProgress >= 100 ? 'bg-green-600' : 'bg-primary-foreground'
                  }`}
                  style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-primary-foreground/70">
                {weeklyProgress >= 100 ? '🎉 Meta atingida!' : `${(100 - weeklyProgress).toFixed(0)}% restante para atingir a meta`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo Rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Ganhos do Mês</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(monthEarnings)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Corridas</p>
                <p className="text-2xl font-bold text-blue-700">{totalTrips}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Car className="text-blue-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Gasto Combustível</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(totalFuelCost)}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <Fuel className="text-red-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">KM Rodados</p>
                <p className="text-2xl font-bold text-purple-700">{formatNumber(totalKm)} km</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="text-purple-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => navigate('/new-trip')} 
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Plus size={24} />
              <span>Nova Corrida</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/add-refuel')} 
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Fuel size={24} />
              <span>Abastecimento</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/add-transaction')} 
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <DollarSign size={24} />
              <span>Transação</span>
            </Button>

            <Button 
              onClick={() => navigate('/?tab=settings&section=categories')} 
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Tag size={24} />
              <span>Categorias</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-green-600" size={20} />
              Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Ganhos Totais:</span>
              <span className="font-semibold text-green-600">{formatCurrency(totalEarnings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Média por Corrida:</span>
              <span className="font-semibold">
                {totalTrips > 0 ? formatCurrency(totalEarnings / totalTrips) : 'R$ 0,00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ganhos por KM:</span>
              <span className="font-semibold">
                {totalKm > 0 ? formatCurrency(totalEarnings / totalKm) : 'R$ 0,00'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="text-blue-600" size={20} />
              Consumo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total de Litros:</span>
              <span className="font-semibold">
                {formatNumber(refuels.reduce((sum, r) => sum + r.liters, 0))} L
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Autonomia Média:</span>
              <span className="font-semibold">
                {totalKm > 0 && refuels.length > 0 
                  ? `${formatNumber(totalKm / refuels.reduce((sum, r) => sum + r.liters, 0))} km/L`
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Abastecimentos:</span>
              <span className="font-semibold">{refuels.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dicas */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-amber-800 mb-2">💡 Dica do Dia</h3>
          <p className="text-amber-700 text-sm">
            {totalTrips === 0 
              ? "Comece registrando sua primeira corrida para acompanhar seus ganhos!"
              : refuels.length === 0
              ? "Não se esqueça de registrar seus abastecimentos para calcular o consumo real!"
              : weeklyProgress < 50
              ? "Você está a caminho da sua meta semanal! Continue assim!"
              : "Parabéns pelo seu desempenho! Mantenha o controle financeiro em dia."
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;

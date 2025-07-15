
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel, DollarSign, Gauge } from 'lucide-react';
import { Refuel } from '@/types';
import { formatCurrency, formatNumber } from '@/utils/calculations';

interface RefuelDashboardProps {
  refuels: Refuel[];
}

const RefuelDashboard: React.FC<RefuelDashboardProps> = ({ refuels }) => {
  const totalSpent = refuels.reduce((sum, refuel) => sum + refuel.totalValue, 0);
  const totalLiters = refuels.reduce((sum, refuel) => sum + refuel.liters, 0);
  const averagePrice = refuels.length > 0 
    ? refuels.reduce((sum, refuel) => sum + refuel.pricePerLiter, 0) / refuels.length 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-red-50 border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-700">
            Gasto Total
          </CardTitle>
          <div className="p-2 rounded-lg bg-red-100">
            <DollarSign className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-800">
            {formatCurrency(totalSpent)}
          </div>
          <p className="text-xs text-red-600 mt-1">
            Em {refuels.length} abastecimentos
          </p>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700">
            Preço Médio
          </CardTitle>
          <div className="p-2 rounded-lg bg-orange-100">
            <Fuel className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-800">
            {formatCurrency(averagePrice)}/L
          </div>
          <p className="text-xs text-orange-600 mt-1">
            Média por litro
          </p>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">
            Total de Litros
          </CardTitle>
          <div className="p-2 rounded-lg bg-blue-100">
            <Gauge className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800">
            {formatNumber(totalLiters)} L
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Litros abastecidos
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RefuelDashboard;

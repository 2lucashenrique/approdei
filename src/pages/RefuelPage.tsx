
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import RefuelList from '@/components/refuel/RefuelList';
import RefuelDashboard from '@/components/refuel/RefuelDashboard';
import WeeklyRefuelChart from '@/components/refuel/WeeklyRefuelChart';
import DateFilter, { DateFilterOptions } from '@/components/filters/DateFilter';
import { Refuel, Settings, Transaction } from '@/types';
import { filterByDate } from '@/utils/dateFilters';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { isWithinInterval } from 'date-fns';

interface RefuelPageProps {
  refuels: Refuel[];
  onAddRefuel: (refuel: Omit<Refuel, 'id' | 'userId'>) => void;
  onDeleteRefuel: (refuelId: string) => void;
  settings: Settings;
  onSettingsUpdate: (settings: Settings) => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
}

const RefuelPage: React.FC<RefuelPageProps> = ({ 
  refuels, 
  onAddRefuel, 
  onDeleteRefuel,
  settings, 
  onSettingsUpdate,
  onAddTransaction 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState<DateFilterOptions>({ type: 'all' });
  const [chartInterval, setChartInterval] = useState<{ start: Date; end: Date } | null>(null);

  const filteredRefuels = filterByDate(refuels, dateFilter);

  // Filtrar abastecimentos baseados na semana selecionada no gráfico
  const chartFilteredRefuels = useMemo(() => {
    if (dateFilter.type === 'all') {
      if (!chartInterval) return filteredRefuels;
      
      return filteredRefuels.filter(refuel => {
        const refuelDate = new Date(refuel.date + 'T12:00:00');
        return isWithinInterval(refuelDate, { 
          start: chartInterval.start, 
          end: chartInterval.end 
        });
      });
    }

    return filteredRefuels;
  }, [filteredRefuels, chartInterval, dateFilter.type]);

  const handleAddRefuel = (refuelData: Omit<Refuel, 'id' | 'userId'>) => {
    console.log('Adicionando abastecimento:', refuelData);
    
    // Adicionar o abastecimento
    onAddRefuel(refuelData as Refuel);
    
    // Determinar a categoria baseada no tipo
    const category = refuelData.type === 'work' ? 'Abastecimento Trabalho' : 'Abastecimento Pessoal';
    const typeLabel = refuelData.type === 'work' ? 'Trabalho' : 'Pessoal';
    
    // Registrar como despesa automaticamente com a categoria correta
    // Omitimos o id para que o backend gere um novo, evitando conflitos
    const transaction: Omit<Transaction, 'id' | 'userId'> = {
      type: 'expense',
      amount: refuelData.totalValue,
      description: `Abastecimento ${typeLabel} - ${refuelData.liters.toFixed(2)}L`,
      date: refuelData.date,
      category: category,
    };
    
    console.log('Registrando transação de abastecimento:', transaction);
    onAddTransaction(transaction as Transaction);
  };

  const handleEditRefuel = (updatedRefuel: Refuel) => {
    console.log('Editando abastecimento:', updatedRefuel);
    onAddRefuel(updatedRefuel); // Usar a mesma função pois ela substitui por ID
  };

  const handleDeleteRefuel = (refuelId: string) => {
    console.log('Deletando abastecimento:', refuelId);
    onDeleteRefuel(refuelId);
  };

  const handleAddNewRefuel = () => {
    navigate('/add-refuel');
  };

  return (
    <div className="space-y-6">
      {/* Header com Filtro e Botão Adicionar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Abastecimentos</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <DateFilter 
            onFilterChange={setDateFilter}
            initialFilters={dateFilter}
          />
          <Button onClick={handleAddNewRefuel} className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus size={20} />
            Novo Abastecimento
          </Button>
        </div>
      </div>

      {/* Gráfico Semanal */}
      <WeeklyRefuelChart 
        refuels={refuels} 
        dateFilter={dateFilter} 
        onWeekChange={(start, end) => setChartInterval({ start, end })}
      />

      {/* Dashboard com dados filtrados */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {dateFilter.type === 'all' && !chartInterval ? 'Resumo Geral' : 'Resumo do Período'}
        </h3>
        <RefuelDashboard refuels={chartFilteredRefuels} />
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Histórico de Abastecimentos ({chartFilteredRefuels.length})
        </h2>
        <RefuelList 
          refuels={chartFilteredRefuels} 
          actions={{
            onEdit: handleEditRefuel,
            onDelete: handleDeleteRefuel
          }}
        />
      </div>
    </div>
  );
};

export default RefuelPage;

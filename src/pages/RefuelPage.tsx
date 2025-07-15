
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import RefuelList from '@/components/refuel/RefuelList';
import RefuelDashboard from '@/components/refuel/RefuelDashboard';
import DateFilter, { DateFilterOptions } from '@/components/filters/DateFilter';
import { Refuel, Settings, Transaction } from '@/types';
import { filterByDate } from '@/utils/dateFilters';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface RefuelPageProps {
  refuels: Refuel[];
  onAddRefuel: (refuel: Refuel) => void;
  onDeleteRefuel: (refuelId: string) => void;
  settings: Settings;
  onSettingsUpdate: (settings: Settings) => void;
  onAddTransaction: (transaction: Transaction) => void;
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

  const filteredRefuels = filterByDate(refuels, dateFilter);

  const handleAddRefuel = (refuel: Refuel) => {
    console.log('Adicionando abastecimento:', refuel);
    
    // Adicionar o abastecimento
    onAddRefuel(refuel);
    
    // Determinar a categoria baseada no tipo
    const category = refuel.type === 'work' ? 'Abastecimento Trabalho' : 'Abastecimento Pessoal';
    const typeLabel = refuel.type === 'work' ? 'Trabalho' : 'Pessoal';
    
    // Registrar como despesa automaticamente com a categoria correta
    const transaction: Transaction = {
      id: `refuel-${refuel.id}`,
      userId: user?.id || '',
      type: 'expense',
      amount: refuel.totalValue,
      description: `Abastecimento ${typeLabel} - ${refuel.liters.toFixed(2)}L`,
      date: refuel.date,
      category: category,
    };
    
    console.log('Registrando transação de abastecimento:', transaction);
    onAddTransaction(transaction);
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

      {/* Dashboard com dados filtrados */}
      <RefuelDashboard refuels={filteredRefuels} />
      
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Histórico de Abastecimentos ({filteredRefuels.length})
        </h2>
        <RefuelList 
          refuels={filteredRefuels} 
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

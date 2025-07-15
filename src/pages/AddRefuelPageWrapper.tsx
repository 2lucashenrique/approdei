
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddRefuelPage from './AddRefuelPage';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import { useMigration } from '@/hooks/useMigration';
import { useBackButton } from '@/hooks/useBackButton';
import { Refuel, Settings, Transaction } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const AddRefuelPageWrapper = () => {
  const navigate = useNavigate();
  const { migrationComplete } = useMigration();
  const { user } = useAuth();

  // Hook para gerenciar botão voltar do dispositivo
  useBackButton({
    onBackPress: () => {
      navigate('/', { replace: true });
    }
  });
  const [refuels, setRefuels] = useIndexedDB<Refuel[]>('refuels', 'all', []);
  const [transactions, setTransactions] = useIndexedDB<Transaction[]>('transactions', 'all', []);
  const [settings, setSettings] = useIndexedDB<Settings>('settings', 'main', {
    userId: user?.id || '',
    fuelPricePerLiter: 5.50,
    platforms: ['Uber', '99', 'Particular'],
    incomeCategories: ['Particular', 'Serviço', 'Extras', 'Gorjetas', 'Bônus'],
    expenseCategories: ['Combustível', 'Manutenção', 'IPVA', 'Seguro', 'Lavagem', 'Estacionamento', 'Pedágio', 'Supermercado', 'Lanche', 'Outros'],
    weeklyGoal: 1000
  });

  if (!migrationComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const addRefuel = (refuel: Refuel) => {
    console.log('Adicionando abastecimento:', refuel);
    
    // Adicionar o abastecimento
    setRefuels(prev => {
      const existingIndex = prev.findIndex(r => r.id === refuel.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = refuel;
        return updated;
      }
      return [...prev, refuel];
    });
    
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
    setTransactions(prev => [...prev, transaction]);
  };

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  return (
    <AddRefuelPage 
      settings={settings}
      onAddRefuel={addRefuel}
      onSettingsUpdate={updateSettings}
    />
  );
};

export default AddRefuelPageWrapper;

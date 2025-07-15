
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddTransactionPage from './AddTransactionPage';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import { useMigration } from '@/hooks/useMigration';
import { useBackButton } from '@/hooks/useBackButton';
import { Transaction, Settings } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const AddTransactionPageWrapper = () => {
  const navigate = useNavigate();
  const { migrationComplete } = useMigration();
  const { user } = useAuth();

  // Hook para gerenciar botão voltar do dispositivo
  useBackButton({
    onBackPress: () => {
      navigate('/', { replace: true });
    }
  });
  const [transactions, setTransactions] = useIndexedDB<Transaction[]>('transactions', 'all', []);
  const [settings] = useIndexedDB<Settings>('settings', 'main', {
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

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
  };

  return (
    <AddTransactionPage 
      settings={settings}
      onAddTransaction={addTransaction}
    />
  );
};

export default AddTransactionPageWrapper;

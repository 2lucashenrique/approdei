
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AddTransactionPage from './AddTransactionPage';
import { useMigration } from '@/hooks/useMigration';
import { useBackButton } from '@/hooks/useBackButton';
import { useUserTransactions, useUserSettings } from '@/hooks/useUserData';
import { Transaction } from '@/types';

const AddTransactionPageWrapper = () => {
  const navigate = useNavigate();
  const { migrationComplete } = useMigration();

  // Hook para gerenciar botão voltar do dispositivo
  useBackButton({
    onBackPress: () => {
      navigate('/', { replace: true });
    }
  });

  const { addTransaction: addTransactionToData } = useUserTransactions();
  const { settings, loading: settingsLoading } = useUserSettings();

  const addTransaction = useMemo(() => (transaction: Omit<Transaction, 'id' | 'userId'>) => {
    addTransactionToData(transaction);
  }, [addTransactionToData]);

  if (!migrationComplete || settingsLoading || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AddTransactionPage 
      settings={settings}
      onAddTransaction={addTransaction}
    />
  );
};

export default AddTransactionPageWrapper;
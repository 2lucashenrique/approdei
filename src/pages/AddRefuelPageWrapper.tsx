
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AddRefuelPage from './AddRefuelPage';
import { useMigration } from '@/hooks/useMigration';
import { useBackButton } from '@/hooks/useBackButton';
import { useUserRefuels, useUserTransactions, useUserSettings } from '@/hooks/useUserData';
import { Refuel, Transaction } from '@/types';

const AddRefuelPageWrapper = () => {
  const navigate = useNavigate();
  const { migrationComplete } = useMigration();

  // Hook para gerenciar botão voltar do dispositivo
  useBackButton({
    onBackPress: () => {
      navigate('/', { replace: true });
    }
  });

  const { addRefuel: addRefuelToData } = useUserRefuels();
  const { addTransaction: addTransactionToData } = useUserTransactions();
  const { settings, updateSettings, loading: settingsLoading } = useUserSettings();

  const addRefuel = useMemo(() => (refuel: Omit<Refuel, 'id' | 'userId'>) => {
    console.log('Adicionando abastecimento:', refuel);
    
    // Adicionar o abastecimento
    addRefuelToData(refuel);
    
    // Determinar a categoria baseada no tipo
    const category = refuel.type === 'work' ? 'Abastecimento Trabalho' : 'Abastecimento Pessoal';
    const typeLabel = refuel.type === 'work' ? 'Trabalho' : 'Pessoal';
    
    // Registrar como despesa automaticamente com a categoria correta
    const transaction: Omit<Transaction, 'id' | 'userId'> = {
      type: 'expense',
      amount: refuel.totalValue,
      description: `Abastecimento ${typeLabel} - ${refuel.liters.toFixed(2)}L`,
      date: refuel.date,
      category: category,
    };
    
    console.log('Registrando transação de abastecimento:', transaction);
    addTransactionToData(transaction);
  }, [addRefuelToData, addTransactionToData]);

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
    <AddRefuelPage 
      settings={settings}
      onAddRefuel={addRefuel}
      onSettingsUpdate={updateSettings}
    />
  );
};

export default AddRefuelPageWrapper;
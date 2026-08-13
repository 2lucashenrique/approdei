import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BottomNavigation from '@/components/BottomNavigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import TripsPage from '@/pages/TripsPage';
import RefuelPage from '@/pages/RefuelPage';
import AccountPage from '@/pages/AccountPage';
import SettingsPage from '@/pages/SettingsPage';
import NewTripPage from '@/pages/NewTripPage';

import { useMigration } from '@/hooks/useMigration';
import { useUserTrips, useUserRefuels, useUserTransactions, useUserSettings } from '@/hooks/useUserData';
import { useBackButton } from '@/hooks/useBackButton';
import { Trip, Refuel, Transaction, Settings } from '@/types';

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'dashboard');

  // Hook para gerenciar botão voltar do dispositivo
  useBackButton({
    onBackPress: () => {
      // Se estamos em uma aba que não é dashboard, voltar para dashboard
      if (activeTab !== 'dashboard') {
        setActiveTab('dashboard');
        navigate('/?tab=dashboard', { replace: true });
      } else {
        // Se estamos no dashboard, tentar voltar no histórico ou sair
        if (window.history.length > 1) {
          navigate(-1);
        }
      }
    }
  });

  // Migração de dados
  const { migrationComplete, migrationError } = useMigration();

  // Hooks de dados do usuário
  const { trips, addTrip: addTripToData, updateTrip, deleteTrip, loading: tripsLoading } = useUserTrips();
  const { refuels, addRefuel: addRefuelToData, updateRefuel, deleteRefuel, loading: refuelsLoading } = useUserRefuels();
  const { transactions, addTransaction: addTransactionToData, updateTransaction, deleteTransaction, loading: transactionsLoading } = useUserTransactions();
  const { settings, updateSettings, loading: settingsLoading } = useUserSettings();

  // Atualizar tab quando URL mudar
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Mostrar loading enquanto dados não carregaram ou migração não completou
  const isLoading = !migrationComplete || tripsLoading || refuelsLoading || transactionsLoading || settingsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!migrationComplete ? 'Migrando dados...' : 'Carregando...'}
          </p>
          {migrationError && (
            <p className="text-red-600 text-sm mt-2">{migrationError}</p>
          )}
        </div>
      </div>
    );
  }

  const addTrip = (trip: Omit<Trip, 'id' | 'userId'>) => {
    addTripToData(trip);
  };

  const editTrip = (updatedTrip: Trip) => {
    const { userId: _, ...tripData } = updatedTrip;
    updateTrip(tripData);
  };

  const addRefuel = (refuel: Omit<Refuel, 'id' | 'userId'>) => {
    addRefuelToData(refuel);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'userId'>) => {
    addTransactionToData(transaction);
  };

  const editTransaction = (updatedTransaction: Transaction) => {
    const { userId: _, ...transactionData } = updatedTransaction;
    updateTransaction(transactionData);
  };

  const updateSettingsData = (newSettings: Settings) => {
    const { userId: _, ...settingsData } = newSettings;
    updateSettings(settingsData);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Rodei';
      case 'trips': return 'Corridas';
      case 'refuel': return 'Combustível';
      case 'account': return 'Minha Conta';
      case 'settings': return 'Configurações';
      default: return 'Rodei';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <HomePage 
          trips={trips} 
          refuels={refuels} 
          transactions={transactions} 
          settings={settings} 
        />;
      case 'trips':
        return <TripsPage 
          trips={trips} 
          onAddTrip={addTrip} 
          onDeleteTrip={deleteTrip}
          settings={settings} 
          onAddTransaction={addTransaction}
        />;
      case 'refuel':
        return <RefuelPage 
          refuels={refuels} 
          onAddRefuel={addRefuel} 
          onDeleteRefuel={deleteRefuel}
          settings={settings} 
          onSettingsUpdate={updateSettingsData}
          onAddTransaction={addTransaction}
        />;
      case 'account':
        return <AccountPage 
          trips={trips} 
          transactions={transactions} 
          settings={settings}
          onAddTransaction={addTransaction}
          onEditTransaction={editTransaction}
          onDeleteTransaction={deleteTransaction}
        />;
      case 'settings':
        return <SettingsPage settings={settings} onUpdateSettings={updateSettingsData} />;
      default:
        return <HomePage 
          trips={trips} 
          refuels={refuels} 
          transactions={transactions} 
          settings={settings} 
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header 
        title={getTabTitle()} 
        showNotifications={activeTab === 'dashboard'} 
      />
      <main className="p-4">
        {renderContent()}
      </main>
      <Footer />
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

// Wrapper para a página NewTrip que precisa acessar o estado do Index
export const NewTripPageWrapper = () => {
  const { migrationComplete } = useMigration();
  const { trips, addTrip: addTripToData } = useUserTrips();
  const { transactions, addTransaction: addTransactionToData } = useUserTransactions();
  const { settings } = useUserSettings();

  // We use useMemo to avoid re-creating the functions on every render
  const addTrip = useMemo(() => (trip: any) => {
    const { userId: _, id: __, ...tripData } = trip;
    addTripToData(tripData);
  }, [addTripToData]);

  const addTransaction = useMemo(() => (transaction: any) => {
    const { userId: _, id: __, ...transactionData } = transaction;
    addTransactionToData(transactionData);
  }, [addTransactionToData]);

  if (!migrationComplete || !settings) {
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
    <NewTripPage 
      onAddTrip={addTrip}
      settings={settings}
      onAddTransaction={addTransaction}
    />
  );
};

export default Index;

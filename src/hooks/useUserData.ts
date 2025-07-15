
import { useIndexedDB } from './useIndexedDB';
import { useAuth } from './useAuth';
import { Trip, Refuel, Transaction, Settings } from '@/types';

export const useUserTrips = () => {
  const { user } = useAuth();
  const [trips, setTrips, { loading, error }] = useIndexedDB<Trip[]>('trips', 'all', []);

  const addTrip = (trip: Omit<Trip, 'userId'>) => {
    if (!user) return;
    
    const tripWithUserId: Trip = {
      ...trip,
      userId: user.id
    };
    
    setTrips(prev => [...prev, tripWithUserId]);
  };

  const updateTrip = (updatedTrip: Omit<Trip, 'userId'>) => {
    if (!user) return;
    
    const tripWithUserId: Trip = {
      ...updatedTrip,
      userId: user.id
    };
    
    setTrips(prev => 
      prev.map(trip => trip.id === tripWithUserId.id ? tripWithUserId : trip)
    );
  };

  const deleteTrip = (tripId: string) => {
    setTrips(prev => prev.filter(trip => trip.id !== tripId));
  };

  return {
    trips,
    addTrip,
    updateTrip,
    deleteTrip,
    loading,
    error
  };
};

export const useUserRefuels = () => {
  const { user } = useAuth();
  const [refuels, setRefuels, { loading, error }] = useIndexedDB<Refuel[]>('refuels', 'all', []);

  const addRefuel = (refuel: Omit<Refuel, 'userId'>) => {
    if (!user) return;
    
    const refuelWithUserId: Refuel = {
      ...refuel,
      userId: user.id
    };
    
    setRefuels(prev => [...prev, refuelWithUserId]);
  };

  const updateRefuel = (updatedRefuel: Omit<Refuel, 'userId'>) => {
    if (!user) return;
    
    const refuelWithUserId: Refuel = {
      ...updatedRefuel,
      userId: user.id
    };
    
    setRefuels(prev => 
      prev.map(refuel => refuel.id === refuelWithUserId.id ? refuelWithUserId : refuel)
    );
  };

  const deleteRefuel = (refuelId: string) => {
    setRefuels(prev => prev.filter(refuel => refuel.id !== refuelId));
  };

  return {
    refuels,
    addRefuel,
    updateRefuel,
    deleteRefuel,
    loading,
    error
  };
};

export const useUserTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions, { loading, error }] = useIndexedDB<Transaction[]>('transactions', 'all', []);

  const addTransaction = (transaction: Omit<Transaction, 'userId'>) => {
    if (!user) return;
    
    const transactionWithUserId: Transaction = {
      ...transaction,
      userId: user.id
    };
    
    setTransactions(prev => [...prev, transactionWithUserId]);
  };

  const updateTransaction = (updatedTransaction: Omit<Transaction, 'userId'>) => {
    if (!user) return;
    
    const transactionWithUserId: Transaction = {
      ...updatedTransaction,
      userId: user.id
    };
    
    setTransactions(prev => 
      prev.map(transaction => transaction.id === transactionWithUserId.id ? transactionWithUserId : transaction)
    );
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId));
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loading,
    error
  };
};

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings, { loading, error }] = useIndexedDB<Settings>('settings', 'main', {
    userId: user?.id || '',
    fuelPricePerLiter: 5.50,
    platforms: ['Uber', '99', 'Particular'],
    incomeCategories: ['Particular', 'Serviço', 'Extras', 'Gorjetas', 'Bônus'],
    expenseCategories: ['Combustível', 'Manutenção', 'IPVA', 'Seguro', 'Lavagem', 'Estacionamento', 'Pedágio', 'Supermercado', 'Lanche', 'Outros'],
    weeklyGoal: 1000
  });

  const updateSettings = (newSettings: Omit<Settings, 'userId'>) => {
    if (!user) return;
    
    const settingsWithUserId: Settings = {
      ...newSettings,
      userId: user.id
    };
    
    setSettings(settingsWithUserId);
  };

  return {
    settings,
    updateSettings,
    loading,
    error
  };
};

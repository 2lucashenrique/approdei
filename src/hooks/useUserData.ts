
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Trip, Refuel, Transaction, Settings } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export const useUserTrips = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading: loading, error } = useQuery({
    queryKey: ['trips', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        date: item.date,
        earnings: Number(item.earnings),
        startTime: item.start_time,
        endTime: item.end_time,
        tripCount: item.trip_count,
        tripsByPlatform: item.trips_by_platform as any,
        earningsByPlatform: item.earnings_by_platform as any,
        kmDriven: Number(item.km_driven),
        carAutonomy: Number(item.car_autonomy),
        fuelConsumed: Number(item.fuel_consumed),
        fuelCost: Number(item.fuel_cost),
        netProfit: Number(item.net_profit),
        earningsPerHour: Number(item.earnings_per_hour),
        observations: item.observations || undefined,
      } as Trip));
    },
    enabled: !!user,
  });

  const addTripMutation = useMutation({
    mutationFn: async (trip: Omit<Trip, 'userId' | 'id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          date: trip.date,
          earnings: trip.earnings,
          start_time: trip.startTime,
          end_time: trip.endTime,
          trip_count: trip.tripCount,
          trips_by_platform: trip.tripsByPlatform,
          earnings_by_platform: trip.earningsByPlatform,
          km_driven: trip.kmDriven,
          car_autonomy: trip.carAutonomy,
          fuel_consumed: trip.fuelConsumed,
          fuel_cost: trip.fuelCost,
          net_profit: trip.netProfit,
          earnings_per_hour: trip.earningsPerHour,
          observations: trip.observations,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', user?.id] });
      toast({ title: "Sucesso", description: "Corrida registrada com sucesso." });
    },
    onError: (error) => {
      console.error('Error adding trip:', error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível registrar a corrida." });
    }
  });

  const updateTripMutation = useMutation({
    mutationFn: async (updatedTrip: Omit<Trip, 'userId'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('trips')
        .update({
          date: updatedTrip.date,
          earnings: updatedTrip.earnings,
          start_time: updatedTrip.startTime,
          end_time: updatedTrip.endTime,
          trip_count: updatedTrip.tripCount,
          trips_by_platform: updatedTrip.tripsByPlatform,
          earnings_by_platform: updatedTrip.earningsByPlatform,
          km_driven: updatedTrip.kmDriven,
          car_autonomy: updatedTrip.carAutonomy,
          fuel_consumed: updatedTrip.fuelConsumed,
          fuel_cost: updatedTrip.fuelCost,
          net_profit: updatedTrip.netProfit,
          earnings_per_hour: updatedTrip.earningsPerHour,
          observations: updatedTrip.observations,
        })
        .eq('id', updatedTrip.id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', user?.id] });
      toast({ title: "Sucesso", description: "Corrida atualizada com sucesso." });
    },
    onError: (error) => {
      console.error('Error updating trip:', error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar a corrida." });
    }
  });

  const deleteTripMutation = useMutation({
    mutationFn: async (tripId: string) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', user?.id] });
      toast({ title: "Sucesso", description: "Corrida excluída com sucesso." });
    },
    onError: (error) => {
      console.error('Error deleting trip:', error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir a corrida." });
    }
  });

  return {
    trips,
    addTrip: addTripMutation.mutate,
    updateTrip: updateTripMutation.mutate,
    deleteTrip: deleteTripMutation.mutate,
    loading,
    error
  };
};

export const useUserRefuels = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: refuels = [], isLoading: loading, error } = useQuery({
    queryKey: ['refuels', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('refuels')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        date: item.date,
        totalValue: Number(item.total_value),
        liters: Number(item.liters),
        pricePerLiter: Number(item.price_per_liter),
        type: item.type as any,
      } as Refuel));
    },
    enabled: !!user,
  });

  const addRefuelMutation = useMutation({
    mutationFn: async (refuel: Omit<Refuel, 'userId' | 'id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      // Destruturação explícita para garantir que não enviamos id ou userId
      const { ...cleanData } = refuel;
      
      const { data, error } = await supabase
        .from('refuels')
        .insert({
          user_id: user.id,
          date: cleanData.date,
          total_value: cleanData.totalValue,
          liters: cleanData.liters,
          price_per_liter: cleanData.pricePerLiter,
          type: cleanData.type,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refuels', user?.id] });
      toast({ title: "Sucesso", description: "Abastecimento registrado com sucesso." });
    },
    onError: (error) => {
      console.error('Error adding refuel:', error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível registrar o abastecimento." });
    }
  });

  const updateRefuelMutation = useMutation({
    mutationFn: async (updatedRefuel: Omit<Refuel, 'userId'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('refuels')
        .update({
          date: updatedRefuel.date,
          total_value: updatedRefuel.totalValue,
          liters: updatedRefuel.liters,
          price_per_liter: updatedRefuel.pricePerLiter,
          type: updatedRefuel.type,
        })
        .eq('id', updatedRefuel.id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refuels', user?.id] });
      toast({ title: "Sucesso", description: "Abastecimento atualizado com sucesso." });
    },
    onError: (error) => {
      console.error('Error updating refuel:', error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar o abastecimento." });
    }
  });

  const deleteRefuelMutation = useMutation({
    mutationFn: async (refuelId: string) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('refuels')
        .delete()
        .eq('id', refuelId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refuels', user?.id] });
      toast({ title: "Sucesso", description: "Abastecimento excluído com sucesso." });
    },
    onError: (error) => {
      console.error('Error deleting refuel:', error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir o abastecimento." });
    }
  });

  return {
    refuels,
    addRefuel: addRefuelMutation.mutate,
    updateRefuel: updateRefuelMutation.mutate,
    deleteRefuel: deleteRefuelMutation.mutate,
    loading,
    error
  };
};

export const useUserTransactions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading: loading, error } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        amount: Number(item.amount),
        type: item.type as any,
        description: item.description,
        date: item.date,
        category: item.category || undefined,
      } as Transaction));
    },
    enabled: !!user,
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'userId' | 'id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      // Destruturação explícita para garantir que não enviamos id ou userId
      const { ...cleanData } = transaction;
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: cleanData.type,
          amount: cleanData.amount,
          description: cleanData.description,
          date: cleanData.date,
          category: cleanData.category,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast({ title: "Sucesso", description: "Transação registrada com sucesso." });
    },
    onError: (error) => {
      console.error('Error adding transaction:', error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível registrar a transação." });
    }
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async (updatedTransaction: Omit<Transaction, 'userId'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('transactions')
        .update({
          type: updatedTransaction.type,
          amount: updatedTransaction.amount,
          description: updatedTransaction.description,
          date: updatedTransaction.date,
          category: updatedTransaction.category,
        })
        .eq('id', updatedTransaction.id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast({ title: "Sucesso", description: "Transação atualizada com sucesso." });
    },
    onError: (error) => {
      console.error('Error updating transaction:', error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar a transação." });
    }
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast({ title: "Sucesso", description: "Transação excluída com sucesso." });
    },
    onError: (error) => {
      console.error('Error deleting transaction:', error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir a transação." });
    }
  });

  return {
    transactions,
    addTransaction: addTransactionMutation.mutate,
    updateTransaction: updateTransactionMutation.mutate,
    deleteTransaction: deleteTransactionMutation.mutate,
    loading,
    error
  };
};

export const useUserSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading: loading, error } = useQuery({
    queryKey: ['settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        // Return default settings if none exist
        return {
          userId: user.id,
          fuelPricePerLiter: 5.50,
          platforms: ['Uber', '99', 'Particular'],
          incomeCategories: ['Particular', 'Serviço', 'Extras', 'Gorjetas', 'Bônus'],
          expenseCategories: ['Combustível', 'Manutenção', 'IPVA', 'Seguro', 'Lavagem', 'Estacionamento', 'Pedágio', 'Supermercado', 'Lanche', 'Outros'],
          weeklyGoal: 1000
        } as Settings;
      }
      
      return {
        userId: data.user_id,
        fuelPricePerLiter: Number(data.fuel_price_per_liter),
        platforms: data.platforms || [],
        incomeCategories: data.income_categories || [],
        expenseCategories: data.expense_categories || [],
        weeklyGoal: data.weekly_goal ? Number(data.weekly_goal) : undefined
      } as Settings;
    },
    enabled: !!user,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Omit<Settings, 'userId'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          fuel_price_per_liter: newSettings.fuelPricePerLiter,
          platforms: newSettings.platforms,
          income_categories: newSettings.incomeCategories,
          expense_categories: newSettings.expenseCategories,
          weekly_goal: newSettings.weeklyGoal,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', user?.id] });
      toast({ title: "Sucesso", description: "Configurações atualizadas." });
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar as configurações." });
    }
  });

  return {
    settings,
    updateSettings: updateSettingsMutation.mutate,
    loading,
    error
  };
};

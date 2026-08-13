
import { useEffect, useState } from 'react';
import { dbManager } from './useIndexedDB';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Trip, Refuel, Transaction, Settings } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useMigration() {
  const { user } = useAuth();
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  useEffect(() => {
    const migrateData = async () => {
      if (!user) {
        setMigrationComplete(true);
        return;
      }

      try {
        const migrationFlag = localStorage.getItem(`migrated_to_db_${user.id}`);
        if (migrationFlag === 'true') {
          setMigrationComplete(true);
          return;
        }

        console.log('Starting data migration to backend...');

        // 1. Migrate Settings
        const idbSettings = await dbManager.get<{ key: string; value: Settings }>('settings', 'main');
        if (idbSettings?.value) {
          await supabase.from('user_settings').upsert({
            user_id: user.id,
            fuel_price_per_liter: idbSettings.value.fuelPricePerLiter,
            platforms: idbSettings.value.platforms,
            income_categories: idbSettings.value.incomeCategories,
            expense_categories: idbSettings.value.expenseCategories,
            weekly_goal: idbSettings.value.weeklyGoal,
          });
        }

        // 2. Migrate Trips
        const idbTrips = await dbManager.getAllByUserId<Trip>('trips', user.id);
        if (idbTrips.length > 0) {
          const tripsToInsert = idbTrips.map(t => ({
            user_id: user.id,
            date: t.date,
            earnings: t.earnings,
            start_time: t.startTime,
            end_time: t.endTime,
            trip_count: t.tripCount,
            trips_by_platform: t.tripsByPlatform,
            earnings_by_platform: t.earningsByPlatform,
            km_driven: t.kmDriven,
            car_autonomy: t.carAutonomy,
            fuel_consumed: t.fuelConsumed,
            fuel_cost: t.fuelCost,
            net_profit: t.netProfit,
            earnings_per_hour: t.earningsPerHour,
            observations: t.observations,
          }));
          await supabase.from('trips').insert(tripsToInsert);
        }

        // 3. Migrate Refuels
        const idbRefuels = await dbManager.getAllByUserId<Refuel>('refuels', user.id);
        if (idbRefuels.length > 0) {
          const refuelsToInsert = idbRefuels.map(r => ({
            user_id: user.id,
            date: r.date,
            total_value: r.totalValue,
            liters: r.liters,
            price_per_liter: r.pricePerLiter,
            type: r.type,
          }));
          await supabase.from('refuels').insert(refuelsToInsert);
        }

        // 4. Migrate Transactions
        const idbTransactions = await dbManager.getAllByUserId<Transaction>('transactions', user.id);
        if (idbTransactions.length > 0) {
          const transToInsert = idbTransactions.map(t => ({
            user_id: user.id,
            type: t.type,
            amount: t.amount,
            description: t.description,
            date: t.date,
            category: t.category,
          }));
          await supabase.from('transactions').insert(transToInsert);
        }

        localStorage.setItem(`migrated_to_db_${user.id}`, 'true');
        setMigrationComplete(true);
        console.log('Migration to backend completed');
        toast({ title: "Migração Concluída", description: "Seus dados foram sincronizados com a nuvem." });
        
      } catch (error) {
        console.error('Migration error:', error);
        setMigrationError('Erro ao sincronizar dados com a nuvem');
        setMigrationComplete(true); // Don't block app even if migration fails
      }
    };

    migrateData();
  }, [user]);

  return { migrationComplete, migrationError };
}

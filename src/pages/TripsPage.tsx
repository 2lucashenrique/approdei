
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TripList from '@/components/trips/TripList';
import DateFilter, { DateFilterOptions } from '@/components/filters/DateFilter';
import WeeklyEarningsChart from '@/components/trips/WeeklyEarningsChart';
import TripMetricsDashboard from '@/components/trips/TripMetricsDashboard';
import { Button } from '@/components/ui/button';
import { Trip, Settings, Transaction } from '@/types';
import { filterByDate } from '@/utils/dateFilters';
import { Plus } from 'lucide-react';
import { isWithinInterval } from 'date-fns';

interface TripsPageProps {
  trips: Trip[];
  onAddTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
  settings: Settings;
  onAddTransaction: (transaction: Transaction) => void;
}

const TripsPage: React.FC<TripsPageProps> = ({ 
  trips, 
  onAddTrip, 
  onDeleteTrip, 
  settings, 
  onAddTransaction 
}) => {
  const [dateFilter, setDateFilter] = useState<DateFilterOptions>({ type: 'all' });
  const [shouldScrollToLatest, setShouldScrollToLatest] = useState(false);
  const [chartInterval, setChartInterval] = useState<{ start: Date; end: Date } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar se acabamos de voltar da página de nova corrida
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('newTrip') === 'true') {
      setShouldScrollToLatest(true);
      // Limpar o parâmetro da URL
      searchParams.delete('newTrip');
      const newUrl = `${location.pathname}?${searchParams.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location]);

  // Reset scroll flag after it's been used
  useEffect(() => {
    if (shouldScrollToLatest) {
      const timer = setTimeout(() => {
        setShouldScrollToLatest(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldScrollToLatest]);

  // Filtrar corridas por data (filtro do cabeçalho)
  const filteredTrips = filterByDate(trips, dateFilter);

  // Filtrar corridas baseadas na semana selecionada no gráfico
  const chartFilteredTrips = useMemo(() => {
    if (!chartInterval) return filteredTrips;
    
    return filteredTrips.filter(trip => {
      const tripDate = new Date(trip.date + 'T12:00:00');
      return isWithinInterval(tripDate, { 
        start: chartInterval.start, 
        end: chartInterval.end 
      });
    });
  }, [filteredTrips, chartInterval]);

  const handleEditTrip = (updatedTrip: Trip) => {
    console.log('Editando corrida:', updatedTrip);
    onAddTrip(updatedTrip); // Usar a mesma função pois ela substitui por ID
  };

  const handleDeleteTrip = (tripId: string) => {
    console.log('Deletando corrida:', tripId);
    onDeleteTrip(tripId);
  };

  const handleNewTrip = () => {
    navigate('/new-trip');
  };

  return (
    <div className="space-y-6">
      {/* Header com Filtro e Botão Nova Corrida */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold">Corridas</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <DateFilter 
            onFilterChange={setDateFilter}
            initialFilters={dateFilter}
          />
          <Button onClick={handleNewTrip} className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus size={20} />
            Nova Corrida
          </Button>
        </div>
      </div>

      {/* Gráfico Semanal */}
      <WeeklyEarningsChart 
        trips={trips} 
        dateFilter={dateFilter} 
        onWeekChange={(start, end) => setChartInterval({ start, end })}
      />

      {/* Dashboard de Métricas */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {dateFilter.type === 'all' && !chartInterval ? 'Resumo Geral' : 'Resumo do Período'}
        </h3>
        <TripMetricsDashboard trips={chartFilteredTrips} />
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Histórico de Corridas ({chartFilteredTrips.length})
        </h2>
        <TripList 
          trips={chartFilteredTrips} 
          actions={{
            onEdit: handleEditTrip,
            onDelete: handleDeleteTrip
          }}
          scrollToLatest={shouldScrollToLatest}
        />
      </div>
    </div>
  );
};

export default TripsPage;

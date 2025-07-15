import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Trip, CrudActions } from '@/types';
import { formatCurrency, formatNumber } from '@/utils/calculations';
import { Edit, Trash2, Clock, Car, Fuel, MapPin, TrendingUp, DollarSign, ChevronDown, Eye } from 'lucide-react';
import TripEditDialog from './TripEditDialog';

interface TripListProps {
  trips: Trip[];
  actions?: CrudActions<Trip>;
  scrollToLatest?: boolean;
}

const TripList: React.FC<TripListProps> = ({ trips, actions, scrollToLatest = false }) => {
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());
  const latestTripRef = useRef<HTMLDivElement>(null);

  // Fazer scroll para a corrida mais recente quando uma nova corrida for adicionada
  useEffect(() => {
    if (scrollToLatest && latestTripRef.current && trips.length > 0) {
      setTimeout(() => {
        latestTripRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [scrollToLatest, trips.length]);

  const calculateHoursWorked = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }
    
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
  };

  const handleSaveEdit = (updatedTrip: Trip) => {
    if (actions?.onEdit) {
      actions.onEdit(updatedTrip);
    }
    setEditingTrip(null);
  };

  const handleDelete = (id: string) => {
    if (actions?.onDelete && confirm('Tem certeza que deseja excluir esta corrida?')) {
      actions.onDelete(id);
    }
  };

  const toggleTripExpanded = (tripId: string) => {
    const newExpanded = new Set(expandedTrips);
    if (newExpanded.has(tripId)) {
      newExpanded.delete(tripId);
    } else {
      newExpanded.add(tripId);
    }
    setExpandedTrips(newExpanded);
  };

  if (trips.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma corrida registrada ainda.
      </div>
    );
  }

  const sortedTrips = trips.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderTripSummary = (trip: Trip) => {
    return (
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {new Date(trip.date).toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </h3>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {formatCurrency(trip.earnings)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Eye 
            size={20} 
            className="text-gray-400"
          />
        </div>
      </div>
    );
  };

  const renderFullTripDetails = (trip: Trip) => {
    const hoursWorked = calculateHoursWorked(trip.startTime, trip.endTime);
    const avgEarningsPerKm = trip.kmDriven > 0 ? trip.earnings / trip.kmDriven : 0;
    const avgEarningsPerTrip = trip.tripCount > 0 ? trip.earnings / trip.tripCount : 0;

    return (
      <>
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {new Date(trip.date).toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <Clock size={16} />
              <span>{trip.startTime} - {trip.endTime}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                <Clock size={18} className="text-blue-600" />
                <span className="text-lg font-bold text-blue-700">{formatNumber(hoursWorked)}h trabalhadas</span>
              </div>
            </div>
          </div>
          
          {actions && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEdit(trip)}
              >
                <Edit size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(trip.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          )}
        </div>

        {/* Resumo Financeiro */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} />
            Resumo Financeiro
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-green-50 p-3 rounded-xl border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">Faturamento Total</p>
                  <p className="text-lg font-bold text-green-700">{formatCurrency(trip.earnings)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-3 rounded-xl border border-red-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Fuel size={16} className="text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-red-600 font-medium">Gasto com Combustível</p>
                  <p className="text-lg font-bold text-red-700">{formatCurrency(trip.fuelCost)}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">Lucro Líquido</p>
                  <p className="text-lg font-bold text-blue-700">{formatCurrency(trip.netProfit)}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-purple-600 font-medium">R$ por Hora</p>
                  <p className="text-lg font-bold text-purple-700">{formatCurrency(trip.earningsPerHour)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas de Viagem */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin size={18} />
            Estatísticas de Viagem
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <Car size={24} className="text-blue-600" />
              </div>
              <div className="text-lg font-semibold">{trip.tripCount}</div>
              <div className="text-xs text-gray-600">Corridas</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">KM</span>
              </div>
              <div className="text-lg font-semibold">{formatNumber(trip.kmDriven)}</div>
              <div className="text-xs text-gray-600">Quilômetros</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <Fuel size={24} className="text-red-600" />
              </div>
              <div className="text-lg font-semibold">{formatNumber(trip.fuelConsumed)}</div>
              <div className="text-xs text-gray-600">Litros</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-green-600 text-xs font-bold">KM/L</span>
              </div>
              <div className="text-lg font-semibold">{formatNumber(trip.carAutonomy)}</div>
              <div className="text-xs text-gray-600">Autonomia</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <DollarSign size={24} className="text-purple-600" />
              </div>
              <div className="text-lg font-semibold">{formatCurrency(avgEarningsPerKm)}</div>
              <div className="text-xs text-gray-600">R$/KM</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-teal-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <DollarSign size={24} className="text-teal-600" />
              </div>
              <div className="text-lg font-semibold">{formatCurrency(avgEarningsPerTrip)}</div>
              <div className="text-xs text-gray-600">R$/Corrida</div>
            </div>
          </div>
        </div>

        {/* Ganhos e Corridas por Plataforma */}
        {((trip.earningsByPlatform && Object.keys(trip.earningsByPlatform).length > 0) || 
          (trip.tripsByPlatform && Object.keys(trip.tripsByPlatform).length > 0)) && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Detalhamento por Plataforma</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trip.earningsByPlatform && Object.keys(trip.earningsByPlatform).length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Ganhos por Plataforma</h5>
                  <div className="space-y-2">
                    {Object.entries(trip.earningsByPlatform).map(([platform, earnings]) => (
                      <div key={platform} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{platform}</span>
                        <Badge variant="outline" className="bg-white">
                          {formatCurrency(earnings)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {trip.tripsByPlatform && Object.keys(trip.tripsByPlatform).length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Corridas por Plataforma</h5>
                  <div className="space-y-2">
                    {Object.entries(trip.tripsByPlatform).map(([platform, trips]) => (
                      <div key={platform} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{platform}</span>
                        <Badge variant="secondary">{trips}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Observações */}
        {trip.observations && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">Observações</h4>
            <p className="text-sm text-yellow-700">{trip.observations}</p>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {sortedTrips.map((trip, index) => {
          const isLatest = index === 0;
          const isExpanded = expandedTrips.has(trip.id);
          
          return (
            <Card 
              key={trip.id} 
              className="overflow-hidden"
              ref={isLatest ? latestTripRef : null}
            >
              <CardContent className="p-6">
                {isLatest ? (
                  // Mostrar corrida mais recente completamente expandida
                  renderFullTripDetails(trip)
                ) : (
                  // Mostrar corridas antigas como collapsible
                  <Collapsible open={isExpanded} onOpenChange={() => toggleTripExpanded(trip.id)}>
                    <CollapsibleTrigger className="w-full" asChild>
                      <div className="cursor-pointer hover:bg-gray-50 -m-6 p-6 rounded-lg transition-colors">
                        {renderTripSummary(trip)}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="border-t pt-6">
                        {renderFullTripDetails(trip)}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editingTrip && (
        <TripEditDialog
          trip={editingTrip}
          onSave={handleSaveEdit}
          onCancel={() => setEditingTrip(null)}
        />
      )}
    </>
  );
};

export default TripList;

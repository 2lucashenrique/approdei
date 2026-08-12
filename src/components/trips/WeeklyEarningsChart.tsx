
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Trip } from '@/types';
import { formatCurrency } from '@/utils/calculations';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DateFilterOptions } from '@/components/filters/DateFilter';

interface WeeklyEarningsChartProps {
  trips: Trip[];
  dateFilter?: DateFilterOptions;
  onWeekChange?: (start: Date, end: Date) => void;
}

const WeeklyEarningsChart: React.FC<WeeklyEarningsChartProps> = ({ trips, dateFilter, onWeekChange }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    return startOfWeek(now, { weekStartsOn: 1 }); // Segunda-feira
  });

  // Função para determinar a data de referência baseada no filtro
  const getFilterReferenceDate = (): Date => {
    if (!dateFilter || dateFilter.type === 'all') {
      return new Date();
    }

    switch (dateFilter.type) {
      case 'specific-date':
        return dateFilter.specificDate ? new Date(dateFilter.specificDate + 'T12:00:00') : new Date();
      
      case 'date-range':
        // Para período de datas, usar a data inicial se disponível, senão a final, senão hoje
        if (dateFilter.startDate) {
          return new Date(dateFilter.startDate + 'T12:00:00');
        } else if (dateFilter.endDate) {
          return new Date(dateFilter.endDate + 'T12:00:00');
        }
        return new Date();
      
      case 'month':
        // Para mês específico, usar o primeiro dia do mês selecionado
        if (dateFilter.month && dateFilter.year) {
          return new Date(dateFilter.year, parseInt(dateFilter.month) - 1, 1);
        }
        return new Date();
      
      default:
        return new Date();
    }
  };

  // Atualizar a semana baseada no filtro de data
  useEffect(() => {
    const referenceDate = getFilterReferenceDate();
    const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
    setCurrentWeekStart(weekStart);
  }, [dateFilter]);

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 }); // Domingo

  // Notificar o pai sobre a mudança de semana
  useEffect(() => {
    if (onWeekChange) {
      onWeekChange(currentWeekStart, weekEnd);
    }
  }, [currentWeekStart, weekEnd, onWeekChange]);
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });

  // Mapear dias da semana em português
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Preparar dados para o gráfico
  const chartData = weekDays.map(day => {
    const dayTrips = trips.filter(trip => 
      isSameDay(new Date(trip.date + 'T12:00:00'), day)
    );
    
    const totalEarnings = dayTrips.reduce((sum, trip) => sum + trip.earnings, 0);
    const totalTrips = dayTrips.reduce((sum, trip) => sum + trip.tripCount, 0);
    
    return {
      day: dayNames[day.getDay()],
      fullDate: format(day, 'dd/MM'),
      earnings: totalEarnings,
      trips: totalTrips,
      isToday: isSameDay(day, new Date())
    };
  });

  const totalWeekEarnings = chartData.reduce((sum, data) => sum + data.earnings, 0);
  const totalWeekTrips = chartData.reduce((sum, data) => sum + data.trips, 0);

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  const handleCurrentWeek = () => {
    const referenceDate = getFilterReferenceDate();
    setCurrentWeekStart(startOfWeek(referenceDate, { weekStartsOn: 1 }));
  };

  const isCurrentWeek = isSameDay(currentWeekStart, startOfWeek(getFilterReferenceDate(), { weekStartsOn: 1 }));

  const chartConfig = {
    earnings: {
      label: 'Ganhos',
      color: '#10b981'
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Ganhos da Semana</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousWeek}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="text-sm font-medium min-w-[120px] text-center">
              {format(currentWeekStart, 'dd/MM')} - {format(weekEnd, 'dd/MM')}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
              className="h-8 w-8 p-0"
            >
              <ChevronRight size={16} />
            </Button>
            {!isCurrentWeek && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCurrentWeek}
                className="text-xs px-2 h-8 ml-2"
              >
                Hoje
              </Button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total da Semana:</span>
            <div className="font-semibold text-green-600">
              {formatCurrency(totalWeekEarnings)}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Total de Corridas:</span>
            <div className="font-semibold text-blue-600">
              {totalWeekTrips}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ChartContainer config={chartConfig} className="h-64 w-full max-w-4xl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    formatCurrency(value as number),
                    'Ganhos'
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${label} (${data.fullDate}) - ${data.trips} corridas`;
                    }
                    return label;
                  }}
                />
              } />
              <Bar 
                dataKey="earnings" 
                fill="var(--color-earnings)"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default WeeklyEarningsChart;

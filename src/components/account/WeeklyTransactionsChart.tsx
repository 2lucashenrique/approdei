
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, ResponsiveContainer, YAxis, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/calculations';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DateFilterOptions } from '@/components/filters/DateFilter';

interface WeeklyTransactionsChartProps {
  transactions: Transaction[];
  dateFilter?: DateFilterOptions;
  onWeekChange?: (start: Date, end: Date) => void;
}

const WeeklyTransactionsChart: React.FC<WeeklyTransactionsChartProps> = ({ transactions, dateFilter, onWeekChange }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    return startOfWeek(now, { weekStartsOn: 1 }); // Segunda-feira
  });

  // Normaliza valores de data (Date ou string) para um Date válido ao meio-dia local
  const toValidDate = (value?: Date | string): Date | null => {
    if (!value) return null;
    const parsed = value instanceof Date ? value : new Date(`${value}T12:00:00`);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  // Função para determinar a data de referência baseada no filtro
  const getFilterReferenceDate = (): Date => {
    if (!dateFilter || dateFilter.type === 'all') {
      return new Date();
    }

    switch (dateFilter.type) {
      case 'specific-date':
        return toValidDate(dateFilter.specificDate) ?? new Date();

      case 'date-range':
        return toValidDate(dateFilter.startDate) ?? toValidDate(dateFilter.endDate) ?? new Date();

      case 'month':
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
    const dayTransactions = transactions.filter(t => 
      isSameDay(new Date(t.date + 'T12:00:00'), day)
    );
    
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      day: dayNames[day.getDay()],
      fullDate: format(day, 'dd/MM'),
      income,
      expenses,
      balance: income - expenses,
      isToday: isSameDay(day, new Date())
    };
  });

  const totalWeekIncome = chartData.reduce((sum, data) => sum + data.income, 0);
  const totalWeekExpenses = chartData.reduce((sum, data) => sum + data.expenses, 0);

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
    income: {
      label: 'Ganhos',
      color: '#10b981'
    },
    expenses: {
      label: 'Despesas',
      color: '#ef4444'
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Fluxo de Caixa Semanal</CardTitle>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mt-2">
          <div>
            <span className="text-gray-600">Ganhos:</span>
            <div className="font-semibold text-green-600">
              {formatCurrency(totalWeekIncome)}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Despesas:</span>
            <div className="font-semibold text-red-600">
              {formatCurrency(totalWeekExpenses)}
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="text-gray-600">Saldo Semanal:</span>
            <div className={`font-semibold ${totalWeekIncome - totalWeekExpenses >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(totalWeekIncome - totalWeekExpenses)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
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
                    name === 'income' ? 'Ganhos' : 'Despesas'
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${label} (${data.fullDate}) - Saldo: ${formatCurrency(data.balance)}`;
                    }
                    return label;
                  }}
                />
              } />
              <Legend />
              <Bar 
                dataKey="income" 
                name="income"
                fill="var(--color-income)"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80"
              />
              <Bar 
                dataKey="expenses" 
                name="expenses"
                fill="var(--color-expenses)"
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

export default WeeklyTransactionsChart;

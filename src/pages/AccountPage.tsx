
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DateFilter, { DateFilterOptions } from '@/components/filters/DateFilter';
import { Trip, Transaction, Settings } from '@/types';
import { formatCurrency } from '@/utils/calculations';
import { filterByDate } from '@/utils/dateFilters';
import { Plus, Minus, Edit, Trash2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import ExpensesChart from '@/components/account/ExpensesChart';
import WeeklyTransactionsChart from '@/components/account/WeeklyTransactionsChart';
import { isWithinInterval } from 'date-fns';

interface AccountPageProps {
  trips: Trip[];
  transactions: Transaction[];
  settings: Settings;
  onAddTransaction: (transaction: Transaction) => void;
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (transactionId: string) => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ 
  trips, 
  transactions, 
  settings,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction 
}) => {
  const navigate = useNavigate();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterOptions>({ type: 'all' });
  const [chartInterval, setChartInterval] = useState<{ start: Date; end: Date } | null>(null);

  console.log('Transações na conta:', transactions);

  // Filtrar transações por data (filtro global)
  const filteredTransactions = filterByDate(transactions, dateFilter);

  // Filtrar transações baseadas na semana selecionada no gráfico
  const chartFilteredTransactions = useMemo(() => {
    if (dateFilter.type === 'all') {
      if (!chartInterval) return filteredTransactions;
      
      return filteredTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date + 'T12:00:00');
        return isWithinInterval(transactionDate, { 
          start: chartInterval.start, 
          end: chartInterval.end 
        });
      });
    }

    return filteredTransactions;
  }, [filteredTransactions, chartInterval, dateFilter.type]);

  // Separar transações automáticas das manuais (usando transações filtradas pelo período/gráfico)
  const automaticTransactions = chartFilteredTransactions.filter(t => 
    t.id.startsWith('trip-') || t.id.startsWith('refuel-')
  );
  const manualTransactions = chartFilteredTransactions.filter(t => 
    !t.id.startsWith('trip-') && !t.id.startsWith('refuel-')
  );

  // Calcular totais
  const totalAutomaticIncome = automaticTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalAutomaticExpenses = automaticTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalManualIncome = manualTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalManualExpenses = manualTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalIncome = totalAutomaticIncome + totalManualIncome;
  const totalExpenses = totalAutomaticExpenses + totalManualExpenses;
  const totalBalance = totalIncome - totalExpenses;

  const handleEdit = (transaction: Transaction) => {
    // TODO: Implementar edição inline ou modal
    console.log('Edit transaction:', transaction);
  };

  const handleDelete = (transactionId: string) => {
    if (onDeleteTransaction && confirm('Tem certeza que deseja excluir esta transação?')) {
      onDeleteTransaction(transactionId);
    }
  };

  const handleAddTransaction = () => {
    navigate('/add-transaction');
  };

  const sortedTransactions = [...chartFilteredTransactions].sort(
    (a, b) => new Date(b.date + 'T12:00:00').getTime() - new Date(a.date + 'T12:00:00').getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header com Filtro e Botão Adicionar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold">Minha Conta</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <DateFilter 
            onFilterChange={setDateFilter}
            initialFilters={dateFilter}
          />
          <Button onClick={handleAddTransaction} className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus size={20} />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Saldo Total
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-blue-800' : 'text-red-600'}`}>
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Saldo para o período selecionado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Ganhos
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-100">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Total de receitas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">
              Despesas
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-100">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-red-600 mt-1">
              Total de gastos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Despesas */}
      <ExpensesChart transactions={filteredTransactions} />

      {/* Lista de Transações */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Histórico de Transações ({filteredTransactions.length})
          </h2>
        </div>
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma transação registrada para o período selecionado.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTransactions.map((transaction) => (
              <Card key={transaction.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {transaction.type === 'income' ? (
                        <Plus className="text-green-600 mr-2" size={20} />
                      ) : (
                        <Minus className="text-red-600 mr-2" size={20} />
                      )}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.category && (
                          <p className="text-sm text-gray-500">{transaction.category}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      {(onEditTransaction || onDeleteTransaction) && (
                        <div className="flex gap-1">
                          {onEditTransaction && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(transaction)}
                            >
                              <Edit size={14} />
                            </Button>
                          )}
                          {onDeleteTransaction && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDelete(transaction.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;

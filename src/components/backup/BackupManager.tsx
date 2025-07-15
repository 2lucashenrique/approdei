import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { dbManager } from '@/hooks/useIndexedDB';
import { Trip, Refuel, Transaction, Settings } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface BackupManagerProps {
  onImportComplete?: () => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ onImportComplete }) => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Função para converter dados para CSV
  const convertToCSV = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escapar aspas e vírgulas
          const stringValue = String(value).replace(/"/g, '""');
          return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') 
            ? `"${stringValue}"` 
            : stringValue;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  // Função melhorada para converter CSV para dados
  const parseCSV = (csvText: string): any[] => {
    console.log('Iniciando parsing do CSV...');
    console.log('Primeiras 200 caracteres:', csvText.substring(0, 200));
    
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      console.error('CSV não possui dados suficientes');
      return [];
    }
    
    // Parse do cabeçalho
    const headerLine = lines[0];
    const headers = [];
    let currentHeader = '';
    let insideQuotes = false;
    
    for (let i = 0; i < headerLine.length; i++) {
      const char = headerLine[i];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        headers.push(currentHeader.trim().replace(/^"(.*)"$/, '$1'));
        currentHeader = '';
      } else {
        currentHeader += char;
      }
    }
    headers.push(currentHeader.trim().replace(/^"(.*)"$/, '$1'));
    
    console.log('Headers encontrados:', headers);
    
    const data = [];
    
    // Parse das linhas de dados
    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      if (!line.trim()) continue;
      
      const values = [];
      let currentValue = '';
      let insideQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());
      
      // Criar objeto da linha
      const row: any = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        // Remover aspas duplas extras
        value = value.replace(/^"(.*)"$/, '$1').replace(/""/g, '"');
        
        // Conversão de tipos melhorada
        if (value === '') {
          row[header] = '';
        } else if (value === 'true') {
          row[header] = true;
        } else if (value === 'false') {
          row[header] = false;
        } else if (!isNaN(Number(value)) && value !== '' && !isNaN(parseFloat(value))) {
          // Verificar se é um número válido
          const numValue = parseFloat(value);
          row[header] = numValue;
        } else {
          row[header] = value;
        }
      });
      
      data.push(row);
    }
    
    console.log(`Parsed ${data.length} linhas de dados`);
    console.log('Primeira linha de dados:', data[0]);
    
    return data;
  };

  const exportData = async () => {
    try {
      setIsExporting(true);
      setMessage({ type: 'info', text: 'Exportando dados...' });

      // Buscar todos os dados do IndexedDB
      const trips = await dbManager.getAll<Trip>('trips');
      const refuels = await dbManager.getAll<Refuel>('refuels');
      const transactions = await dbManager.getAll<Transaction>('transactions');

      // Criar dados consolidados com tipo identificador
      const consolidatedData = [];

      // Adicionar corridas
      trips.forEach(trip => {
        consolidatedData.push({
          tipo: 'corrida',
          id: trip.id,
          userId: trip.userId,
          date: trip.date,
          earnings: trip.earnings || '',
          startTime: trip.startTime || '',
          endTime: trip.endTime || '',
          tripCount: trip.tripCount || '',
          kmDriven: trip.kmDriven || '',
          carAutonomy: trip.carAutonomy || '',
          fuelConsumed: trip.fuelConsumed || '',
          fuelCost: trip.fuelCost || '',
          netProfit: trip.netProfit || '',
          earningsPerHour: trip.earningsPerHour || '',
          observations: trip.observations || '',
          totalValue: '',
          liters: '',
          pricePerLiter: '',
          type: '',
          amount: '',
          description: '',
          category: ''
        });
      });

      // Adicionar abastecimentos
      refuels.forEach(refuel => {
        consolidatedData.push({
          tipo: 'abastecimento',
          id: refuel.id,
          userId: refuel.userId,
          date: refuel.date,
          totalValue: refuel.totalValue,
          liters: refuel.liters,
          pricePerLiter: refuel.pricePerLiter,
          type: refuel.type || '',
          earnings: '',
          startTime: '',
          endTime: '',
          tripCount: '',
          kmDriven: '',
          carAutonomy: '',
          fuelConsumed: '',
          fuelCost: '',
          netProfit: '',
          earningsPerHour: '',
          observations: '',
          amount: '',
          description: '',
          category: ''
        });
      });

      // Adicionar transações
      transactions.forEach(transaction => {
        consolidatedData.push({
          tipo: 'transacao',
          id: transaction.id,
          userId: transaction.userId,
          date: transaction.date,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description || '',
          category: transaction.category || '',
          earnings: '',
          startTime: '',
          endTime: '',
          tripCount: '',
          kmDriven: '',
          carAutonomy: '',
          fuelConsumed: '',
          fuelCost: '',
          netProfit: '',
          earningsPerHour: '',
          observations: '',
          totalValue: '',
          liters: '',
          pricePerLiter: ''
        });
      });

      // Definir cabeçalhos consolidados
      const headers = [
        'tipo', 'id', 'userId', 'date', 
        // Campos de corridas
        'earnings', 'startTime', 'endTime', 'tripCount', 'kmDriven', 'carAutonomy', 
        'fuelConsumed', 'fuelCost', 'netProfit', 'earningsPerHour', 'observations',
        // Campos de abastecimentos
        'totalValue', 'liters', 'pricePerLiter',
        // Campos de transações
        'type', 'amount', 'description', 'category'
      ];

      // Converter para CSV
      const csvContent = convertToCSV(consolidatedData, headers);

      // Criar arquivo para download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `drivemanager-backup-completo-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ 
        type: 'success', 
        text: `Backup completo criado com sucesso! ${trips.length} corridas, ${refuels.length} abastecimentos e ${transactions.length} transações exportadas em um único arquivo.` 
      });

    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      setMessage({ type: 'error', text: 'Erro ao criar backup. Tente novamente.' });
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (file: File) => {
    try {
      setIsImporting(true);
      setMessage({ type: 'info', text: 'Importando dados...' });
      console.log('Iniciando importação do arquivo:', file.name);

      if (!file.name.endsWith('.csv')) {
        throw new Error('Formato de arquivo não suportado. Use apenas arquivos CSV.');
      }

      // Ler arquivo CSV
      const csvContent = await file.text();
      console.log('Arquivo lido, tamanho:', csvContent.length);
      
      const data = parseCSV(csvContent);
      console.log('Dados parseados:', data.length, 'itens');

      if (data.length === 0) {
        throw new Error('Nenhum dado válido encontrado no arquivo CSV.');
      }

      // Separar dados por tipo
      const tripsData: Trip[] = [];
      const refuelsData: Refuel[] = [];
      const transactionsData: Transaction[] = [];

      data.forEach((row, index) => {
        console.log(`Processando linha ${index + 1}:`, row);
        
        try {
          if (row.tipo === 'corrida') {
            const trip: Trip = {
              id: String(row.id),
              userId: user?.id || String(row.userId),
              date: String(row.date),
              earnings: Number(row.earnings) || 0,
              startTime: String(row.startTime || ''),
              endTime: String(row.endTime || ''),
              tripCount: Number(row.tripCount) || 0,
              kmDriven: Number(row.kmDriven) || 0,
              carAutonomy: Number(row.carAutonomy) || 0,
              fuelConsumed: Number(row.fuelConsumed) || 0,
              fuelCost: Number(row.fuelCost) || 0,
              netProfit: Number(row.netProfit) || 0,
              earningsPerHour: Number(row.earningsPerHour) || 0,
              observations: String(row.observations || '')
            };
            tripsData.push(trip);
            console.log('Trip adicionado:', trip.id);
          } else if (row.tipo === 'abastecimento') {
            const refuel: Refuel = {
              id: String(row.id),
              userId: user?.id || String(row.userId),
              date: String(row.date),
              totalValue: Number(row.totalValue) || 0,
              liters: Number(row.liters) || 0,
              pricePerLiter: Number(row.pricePerLiter) || 0,
              type: row.type as 'work' | 'personal' || undefined
            };
            refuelsData.push(refuel);
            console.log('Refuel adicionado:', refuel.id);
          } else if (row.tipo === 'transacao') {
            const transaction: Transaction = {
              id: String(row.id),
              userId: user?.id || String(row.userId),
              type: row.type as 'income' | 'expense',
              amount: Number(row.amount) || 0,
              description: String(row.description || ''),
              date: String(row.date),
              category: String(row.category || '')
            };
            transactionsData.push(transaction);
            console.log('Transaction adicionada:', transaction.id);
          }
        } catch (rowError) {
          console.error(`Erro ao processar linha ${index + 1}:`, rowError, row);
        }
      });

      console.log(`Dados separados: ${tripsData.length} trips, ${refuelsData.length} refuels, ${transactionsData.length} transactions`);

      // Limpar dados existentes do usuário atual apenas
      const currentUserId = user?.id;
      if (currentUserId) {
        console.log('Limpando dados existentes do usuário atual...');
        
        // Obter todos os dados existentes
        const allTrips = await dbManager.getAll<Trip>('trips');
        const allRefuels = await dbManager.getAll<Refuel>('refuels');
        const allTransactions = await dbManager.getAll<Transaction>('transactions');
        
        // Filtrar para manter apenas dados de outros usuários
        const otherUsersTrips = allTrips.filter(trip => trip.userId !== currentUserId);
        const otherUsersRefuels = allRefuels.filter(refuel => refuel.userId !== currentUserId);
        const otherUsersTransactions = allTransactions.filter(transaction => transaction.userId !== currentUserId);
        
        // Limpar stores
        await dbManager.clear('trips');
        await dbManager.clear('refuels');
        await dbManager.clear('transactions');
        
        // Restaurar dados de outros usuários
        console.log('Restaurando dados de outros usuários...');
        for (const trip of otherUsersTrips) {
          await dbManager.set('trips', trip);
        }
        for (const refuel of otherUsersRefuels) {
          await dbManager.set('refuels', refuel);
        }
        for (const transaction of otherUsersTransactions) {
          await dbManager.set('transactions', transaction);
        }
      }

      // Importar novos dados
      console.log('Importando novos dados...');
      for (const trip of tripsData) {
        if (trip.id) {
          await dbManager.set('trips', trip);
        }
      }
      for (const refuel of refuelsData) {
        if (refuel.id) {
          await dbManager.set('refuels', refuel);
        }
      }
      for (const transaction of transactionsData) {
        if (transaction.id) {
          await dbManager.set('transactions', transaction);
        }
      }

      console.log('Importação concluída com sucesso!');
      
      // Disparar evento para forçar atualização dos hooks
      window.dispatchEvent(new CustomEvent('dataImported', {
        detail: { userId: user?.id }
      }));

      // Usar toast em vez da mensagem local
      toast({
        title: "✅ Importação Concluída!",
        description: `Dados restaurados com sucesso:
• ${tripsData.length} corridas
• ${refuelsData.length} abastecimentos  
• ${transactionsData.length} transações`,
        duration: 5000,
      });
      
      setMessage({ 
        type: 'success', 
        text: `Dados importados com sucesso! ${tripsData.length} corridas, ${refuelsData.length} abastecimentos e ${transactionsData.length} transações restauradas.` 
      });

      // Notificar componente pai que a importação foi concluída
      if (onImportComplete) {
        setTimeout(() => {
          onImportComplete();
        }, 1000);
      }

    } catch (error) {
      console.error('Erro ao importar dados:', error);
      
      // Toast de erro
      toast({
        title: "❌ Erro na Importação",
        description: `Falha ao importar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
        duration: 5000,
      });
      
      setMessage({ type: 'error', text: `Erro ao importar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Verifique o console para mais detalhes.` });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Arquivo selecionado:', file.name, 'Tamanho:', file.size);
      importData(file);
    }
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Exportar Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Crie um backup completo de todos os seus dados em um único arquivo CSV 
            que pode ser aberto no Excel, Google Sheets ou usado para restaurar seus dados.
          </p>
          <Button 
            onClick={exportData} 
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Criar Backup Completo (CSV)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-green-600" />
            Importar Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Restaure seus dados a partir de um arquivo de backup CSV completo. 
            <strong className="text-red-600"> Atenção: </strong>
            Todos os dados atuais serão substituídos pelos dados do backup.
          </p>
          <div className="space-y-3">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isImporting}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {isImporting && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Importando dados...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 
                         message.type === 'success' ? 'border-green-200 bg-green-50' : 
                         'border-blue-200 bg-blue-50'}>
          <div className="flex items-center gap-2">
            {message.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
            {message.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
            {message.type === 'info' && <AlertCircle className="w-4 h-4 text-blue-600" />}
            <AlertDescription className={
              message.type === 'error' ? 'text-red-800' : 
              message.type === 'success' ? 'text-green-800' : 
              'text-blue-800'
            }>
              {message.text}
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default BackupManager;

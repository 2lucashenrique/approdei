
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft } from 'lucide-react';
import { Transaction, Settings } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';

interface AddTransactionPageProps {
  settings: Settings;
  onAddTransaction: (transaction: any) => void;
}

const AddTransactionPage: React.FC<AddTransactionPageProps> = ({ 
  settings,
  onAddTransaction 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
  });

  // Obter categorias das configurações
  const availableCategories = formData.type === 'income' 
    ? settings.incomeCategories || [] 
    : settings.expenseCategories || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    const transaction: Omit<Transaction, 'id' | 'userId'> = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
      category: formData.category,
    };

    onAddTransaction(transaction);
    
    toast({
      title: "Transação adicionada!",
      description: `${formData.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${parseFloat(formData.amount).toFixed(2)} foi registrada.`,
    });

    // Voltar para a página de conta
    navigate('/?tab=account');
  };

  const handleCancel = () => {
    navigate('/?tab=account');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Nova Transação" />

      <div className="p-4">
        {/* Header com botão voltar */}
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleCancel}
            className="h-10 w-10"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">Adicionar Transação</h1>
        </div>

        {/* Formulário */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Nova Transação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Tipo</Label>
                <RadioGroup 
                  value={formData.type} 
                  onValueChange={(value: 'income' | 'expense') => 
                    setFormData(prev => ({ ...prev, type: value, category: '' }))
                  }
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income">Receita</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense">Despesa</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição da transação"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Adicionar Transação
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddTransactionPage;

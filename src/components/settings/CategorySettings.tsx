
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CreditCard, Tag, ArrowLeft } from 'lucide-react';
import { Settings as SettingsType } from '@/types';
import CategoryManager from './CategoryManager';

interface CategorySettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: SettingsType) => void;
  onBack: () => void;
}

const CategorySettings: React.FC<CategorySettingsProps> = ({ settings, onUpdateSettings, onBack }) => {
  const handleUpdateIncomeCategories = (incomeCategories: string[]) => {
    onUpdateSettings({ ...settings, incomeCategories });
  };

  const handleUpdateExpenseCategories = (expenseCategories: string[]) => {
    onUpdateSettings({ ...settings, expenseCategories });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold">Gerenciar Categorias</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            Categorias de Receita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryManager 
            title="Categorias de Receita"
            categories={settings.incomeCategories || []}
            onUpdateCategories={handleUpdateIncomeCategories}
            placeholder="Ex: Corridas, Delivery, Extras..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="w-5 h-5 text-red-600" />
            Categorias de Despesa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryManager 
            title="Categorias de Despesa"
            categories={settings.expenseCategories || []}
            onUpdateCategories={handleUpdateExpenseCategories}
            placeholder="Ex: Combustível, Manutenção, IPVA..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CategorySettings;

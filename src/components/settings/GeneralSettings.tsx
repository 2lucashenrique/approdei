
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Settings, ArrowLeft, Fuel, Target } from 'lucide-react';
import { Settings as SettingsType } from '@/types';
import { formatCurrency } from '@/utils/calculations';

interface GeneralSettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: SettingsType) => void;
  onBack: () => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, onUpdateSettings, onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold">Configurações Gerais</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Visão Geral das Configurações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Configurações Atuais</h3>
              <div className="space-y-2">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <Fuel className="w-4 h-4" />
                  Combustível: {formatCurrency(settings.fuelPricePerLiter)}/L
                </p>
                {settings.weeklyGoal && settings.weeklyGoal > 0 && (
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Meta Semanal: {formatCurrency(settings.weeklyGoal)}
                  </p>
                )}
                <p className="text-sm text-blue-700">
                  Plataformas: {settings.platforms?.length || 0} configuradas
                </p>
                <p className="text-sm text-blue-700">
                  Categorias de Receita: {settings.incomeCategories?.length || 0}
                </p>
                <p className="text-sm text-blue-700">
                  Categorias de Despesa: {settings.expenseCategories?.length || 0}
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Use o menu principal para configurar cada seção específica do aplicativo.
                Todas as configurações são salvas automaticamente no seu dispositivo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;

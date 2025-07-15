import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from '@/types';
import GeneralSettings from '@/components/settings/GeneralSettings';
import CategorySettings from '@/components/settings/CategorySettings';
import PlatformSettings from '@/components/settings/PlatformSettings';
import FuelPriceSettings from '@/components/settings/FuelPriceSettings';
import WeeklyGoalSettings from '@/components/settings/WeeklyGoalSettings';
import AccountSettings from '@/components/settings/AccountSettings';
import BackupSettings from '@/components/settings/BackupSettings';
import AboutSettings from '@/components/settings/AboutSettings';
import { 
  Settings as SettingsIcon, 
  User, 
  Tag, 
  Fuel, 
  Target, 
  Smartphone, 
  Download, 
  Info 
} from 'lucide-react';

interface SettingsPageProps {
  settings: Settings;
  onUpdateSettings: (settings: Settings) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdateSettings }) => {
  const [searchParams] = useSearchParams();
  const sectionParam = searchParams.get('section');
  const [activeSection, setActiveSection] = useState<string>(sectionParam || 'menu');

  useEffect(() => {
    if (sectionParam) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam]);

  const settingsSections = [
    { id: 'account', label: 'Minha Conta', description: 'Gerenciar conta e senha', icon: User, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 'general', label: 'Configurações Gerais', description: 'Configurações básicas do app', icon: SettingsIcon, color: 'text-gray-700', bgColor: 'bg-gray-100' },
    { id: 'goal', label: 'Meta Semanal', description: 'Definir meta de ganhos', icon: Target, color: 'text-green-600', bgColor: 'bg-green-100' },
    { id: 'categories', label: 'Categorias', description: 'Receitas e despesas', icon: Tag, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { id: 'backup', label: 'Backup & Restauração', description: 'Exportar e importar dados', icon: Download, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    { id: 'fuel', label: 'Preço do Combustível', description: 'Configurar preço por litro', icon: Fuel, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { id: 'platforms', label: 'Plataformas', description: 'Gerenciar apps que dirijo', icon: Smartphone, color: 'text-pink-600', bgColor: 'bg-pink-100' },
    { id: 'about', label: 'Sobre o App', description: 'Informações e versão', icon: Info, color: 'text-teal-600', bgColor: 'bg-teal-100' },
  ];

  const handleBackToMenu = () => {
    setActiveSection('menu');
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings settings={settings} onUpdateSettings={onUpdateSettings} onBack={handleBackToMenu} />;
      case 'account':
        return <AccountSettings onBack={handleBackToMenu} />;
      case 'categories':
        return (
          <CategorySettings 
            settings={settings} 
            onUpdateSettings={onUpdateSettings}
            onBack={handleBackToMenu}
          />
        );
      case 'platforms':
        return (
          <PlatformSettings 
            settings={settings} 
            onUpdateSettings={onUpdateSettings}
            onBack={handleBackToMenu}
          />
        );
      case 'fuel':
        return (
          <FuelPriceSettings 
            settings={settings} 
            onUpdateSettings={onUpdateSettings}
            onBack={handleBackToMenu}
          />
        );
      case 'goal':
        return (
          <WeeklyGoalSettings 
            settings={settings} 
            onUpdateSettings={onUpdateSettings}
            onBack={handleBackToMenu}
          />
        );
      case 'backup':
        return <BackupSettings onBack={handleBackToMenu} />;
      case 'about':
        return <AboutSettings onBack={handleBackToMenu} />;
      default:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
              <p className="text-gray-600">Personalize seu aplicativo</p>
            </div>
            
            <div className="space-y-3">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <Card key={section.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent 
                      className="p-4"
                      onClick={() => setActiveSection(section.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${section.bgColor} flex-shrink-0`}>
                          <Icon className={`h-6 w-6 ${section.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{section.label}</h3>
                          <p className="text-sm text-gray-600">{section.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderActiveSection()}
    </div>
  );
};

export default SettingsPage;

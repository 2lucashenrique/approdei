
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Smartphone, ArrowLeft } from 'lucide-react';
import { Settings as SettingsType } from '@/types';
import PlatformManager from './PlatformManager';

interface PlatformSettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: SettingsType) => void;
  onBack: () => void;
}

const PlatformSettings: React.FC<PlatformSettingsProps> = ({ settings, onUpdateSettings, onBack }) => {
  const handleUpdatePlatforms = (platforms: string[]) => {
    onUpdateSettings({ ...settings, platforms });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold">Plataformas que Dirijo</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-600" />
            Gerenciar Plataformas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PlatformManager 
            platforms={settings.platforms || []} 
            onUpdatePlatforms={handleUpdatePlatforms} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformSettings;

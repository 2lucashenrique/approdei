
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, HardDrive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackupManager from '@/components/backup/BackupManager';

interface BackupSettingsProps {
  onBack: () => void;
}

const BackupSettings: React.FC<BackupSettingsProps> = ({ onBack }) => {
  const navigate = useNavigate();

  const handleImportComplete = () => {
    // Voltar para as configurações após importação
    setTimeout(() => {
      onBack();
      // Recarregar dados no componente pai
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold">Backup & Restauração</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-gray-600" />
            Gerenciar Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600 mb-4">
            <p>
              <strong>Por que fazer backup?</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Proteger seus dados contra perda acidental</li>
              <li>Migrar dados para um novo dispositivo</li>
              <li>Restaurar dados após formatação</li>
              <li>Manter histórico das suas corridas e ganhos</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <BackupManager onImportComplete={handleImportComplete} />
    </div>
  );
};

export default BackupSettings;

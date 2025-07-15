
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useBackButton } from '@/hooks/useBackButton';
import BackupManager from '@/components/backup/BackupManager';

const BackupPage: React.FC = () => {
  const navigate = useNavigate();

  // Hook para gerenciar botão voltar do dispositivo
  useBackButton({
    onBackPress: () => {
      navigate('/', { replace: true });
    }
  });

  const handleImportComplete = () => {
    // Recarregar a página para refletir os dados importados
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-semibold">Backup & Restauração</h1>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            Gerencie seus dados
          </h2>
          <p className="text-gray-600 text-sm">
            Faça backup dos seus dados para não perder informações importantes 
            e restaure quando necessário em qualquer dispositivo.
          </p>
        </div>

        <BackupManager onImportComplete={handleImportComplete} />
      </div>
    </div>
  );
};

export default BackupPage;

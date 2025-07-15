import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Info, ArrowLeft } from 'lucide-react';
interface AboutSettingsProps {
  onBack: () => void;
}
const AboutSettings: React.FC<AboutSettingsProps> = ({
  onBack
}) => {
  return <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold">Sobre o App</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-600" />
            Informações do Aplicativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Rodei</strong>
            </p>
            <p>
              App desenvolvido para motoristas de aplicativo gerenciarem suas corridas, 
              abastecimentos e lucros de forma prática e organizada.
            </p>
            <p>
              Todos os dados são armazenados localmente no seu dispositivo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default AboutSettings;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Lock, Crown, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AccountSettingsProps {
  onBack: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ onBack }) => {
  const { user, updatePassword } = useAuth();
  const { toast } = useToast();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (success) {
        toast({
          title: "Senha atualizada",
          description: "Sua senha foi alterada com sucesso",
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast({
          title: "Erro",
          description: "Senha atual incorreta",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a senha",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    toast({
      title: "Em breve",
      description: "A funcionalidade de assinatura será implementada em breve",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold">Minha Conta</h2>
      </div>

      {/* Informações do usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Informações da Conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <p className="text-sm text-gray-700 font-medium">{user?.name}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-sm text-gray-700 font-medium">{user?.email}</p>
            </div>
            <div>
              <Label>Membro desde</Label>
              <p className="text-sm text-gray-700">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Assinatura */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Plano Atual</h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Gratuito
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Você está usando o plano gratuito do Rodei. Upgrade para desbloquear recursos premium.
              </p>
              
              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-sm text-gray-700">Recursos do Plano Gratuito:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Registro de corridas ilimitadas
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Controle de combustível
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Relatórios básicos
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Backup local
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Plano Premium</h3>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  Em Breve
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Desbloqueie recursos avançados para otimizar seus ganhos.
              </p>
              
              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-sm text-gray-700">Recursos Premium:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    Relatórios avançados com gráficos
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    Análise de rentabilidade por horário
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    Backup automático na nuvem
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    Lembretes de manutenção
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    Exportação de relatórios
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    Suporte prioritário
                  </li>
                </ul>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-gray-900">R$ 9,90</span>
                  <span className="text-sm text-gray-600">/mês</span>
                </div>
                <Button 
                  onClick={handleUpgradeClick}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Fazer Upgrade
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alterar senha */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            Alterar Senha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                placeholder="Digite sua senha atual"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handleInputChange}
                placeholder="Digite a nova senha"
                required
                minLength={6}
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirme a nova senha"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Atualizando...' : 'Alterar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;

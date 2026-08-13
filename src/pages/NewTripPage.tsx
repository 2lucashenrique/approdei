
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TripForm from '@/components/trips/TripForm';
import { Trip, Settings, Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBackButton } from '@/hooks/useBackButton';
import Header from '@/components/Header';

interface NewTripPageProps {
  onAddTrip: (trip: any) => void;
  settings: Settings;
  onAddTransaction: (transaction: any) => void;
}

const NewTripPage: React.FC<NewTripPageProps> = ({ 
  onAddTrip, 
  settings, 
  onAddTransaction 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Hook para gerenciar botão voltar do dispositivo
  useBackButton({
    onBackPress: () => {
      navigate('/', { replace: true });
    }
  });

  const handleAddTrip = (tripData: Omit<Trip, 'id' | 'userId'>) => {
    console.log('Adicionando corrida:', tripData);
    
    if (!user) return;
    
    // Adicionar a corrida
    onAddTrip(tripData);
    
    // Registrar como receita automaticamente
    const transaction: Omit<Transaction, 'id' | 'userId'> = {
      type: 'income',
      amount: tripData.earnings,
      description: `Corrida - ${tripData.tripCount} viagens`,
      date: tripData.date,
    };
    
    console.log('Registrando transação de corrida:', transaction);
    onAddTransaction(transaction);
    
    // Navegar de volta para a página de corridas com parâmetro para fazer scroll
    navigate('/?tab=trips&newTrip=true');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Nova Corrida" />

      {/* Content */}
      <main className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/?tab=trips')}
            className="h-10 w-10"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">Nova Corrida</h1>
        </div>
        
        <TripForm onSubmit={handleAddTrip} settings={settings} />
      </main>
    </div>
  );
};

export default NewTripPage;

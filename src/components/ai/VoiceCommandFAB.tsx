import React, { useState } from 'react';
import { Mic, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';
import { Settings, Trip, Refuel, Transaction } from '@/types';
import { calculateFuelConsumed, calculateFuelCost, calculateNetProfit, calculateEarningsPerHour, calculateHoursWorked } from '@/utils/calculations';

interface VoiceCommandFABProps {
  settings: Settings;
  onAddTrip: (trip: Trip) => void;
  onAddRefuel: (refuel: Refuel) => void;
  onAddTransaction: (transaction: Transaction) => void;
}

const VoiceCommandFAB: React.FC<VoiceCommandFABProps> = ({ 
  settings, 
  onAddTrip, 
  onAddRefuel, 
  onAddTransaction 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    isListening, 
    transcript, 
    isProcessing, 
    result, 
    error, 
    aiQuestion,
    startListening, 
    reset 
  } = useVoiceCommand(settings);

  const handleConfirm = () => {
    if (!result || !result.type || !result.data || !settings) return;

    const today = new Date().toISOString().split('T')[0];
    const itemDate = result.data.date || today;
    
    
    if (result.type === 'trip') {
      const { earnings, kmDriven, carAutonomy, startTime, endTime, platform } = result.data;
      const hoursWorked = calculateHoursWorked(startTime, endTime);
      const fuelConsumed = calculateFuelConsumed(kmDriven, carAutonomy || 10);
      const fuelCost = calculateFuelCost(fuelConsumed, settings.fuelPricePerLiter);
      const netProfit = calculateNetProfit(earnings, fuelCost);
      const earningsPerHour = calculateEarningsPerHour(netProfit, hoursWorked);

      const trip: Trip = {
        id: Date.now().toString(),
        userId: settings.userId,
        date: itemDate,
        earnings,
        startTime,
        endTime,
        tripCount: 1,
        kmDriven,
        carAutonomy: carAutonomy || 10,
        fuelConsumed,
        fuelCost,
        netProfit,
        earningsPerHour,
        tripsByPlatform: platform ? { [platform]: 1 } : {},
        earningsByPlatform: platform ? { [platform]: earnings } : {}
      };
      onAddTrip(trip);
    } else if (result.type === 'refuel') {
      const { totalValue, pricePerLiter, refuelType } = result.data;
      const refuel: Refuel = {
        id: Date.now().toString(),
        userId: settings.userId,
        date: itemDate,
        totalValue,
        pricePerLiter: pricePerLiter || settings.fuelPricePerLiter,
        liters: totalValue / (pricePerLiter || settings.fuelPricePerLiter),
        type: refuelType || 'work'
      };
      onAddRefuel(refuel);
    } else if (result.type === 'transaction') {
      const { transactionType, amount, description, category } = result.data;
      const transaction: Transaction = {
        id: Date.now().toString(),
        userId: settings.userId,
        type: transactionType,
        amount,
        description,
        date: itemDate,
        category
      };
      onAddTransaction(transaction);
    }

    setIsOpen(false);
    reset();
  };

  if (!settings) return null;

  return (
    <>
      <div className="fixed bottom-20 right-4 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setIsOpen(true);
            reset();
            setTimeout(startListening, 300);
          }}
          className="bg-primary text-primary-foreground p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <Mic size={24} />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Mic className="text-primary" size={20} />
                    Comando de Voz
                  </h3>
                  <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                  </button>
                </div>

                <div className="min-h-[120px] flex flex-col items-center justify-center bg-gray-50 rounded-xl p-4 mb-6 border-2 border-dashed border-gray-200">
                  {isListening ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex gap-1 items-end h-8">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [8, 24, 8] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                            className="w-1.5 bg-primary rounded-full"
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 italic text-center">
                        {transcript || 'Ouvindo...'}
                      </p>
                    </div>
                  ) : isProcessing ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={32} />
                      <p className="text-gray-600">Processando...</p>
                    </div>
                  ) : aiQuestion ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 w-full">
                        <p className="text-primary font-medium text-center text-lg">
                          {aiQuestion}
                        </p>
                      </div>
                      <div className="flex gap-1 items-end h-6">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            className="w-2 h-2 bg-primary rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center gap-2 text-red-500 text-center">
                      <AlertCircle size={32} />
                      <p className="font-medium px-4">{error}</p>
                      <Button variant="outline" size="sm" onClick={startListening} className="mt-2">
                        Tentar Novamente
                      </Button>
                    </div>
                  ) : result ? (
                    <div className="w-full space-y-3">
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                          <Check size={16} /> Resumo do Registro:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                          {Object.entries(result.data).map(([key, value]) => (
                            value && (
                              <div key={key} className="flex flex-col">
                                <span className="opacity-70 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="font-bold">{String(value)}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center">Deseja confirmar esses dados?</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center">
                      Diga algo como:<br/>
                      <span className="text-gray-500 italic">"Registrar uma corrida"</span> ou<br/>
                      <span className="text-gray-500 italic">"Fiz 200 reais na Uber hoje"</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  {result ? (
                    <>
                      <Button variant="outline" className="flex-1" onClick={reset}>
                        Descartar
                      </Button>
                      <Button className="flex-1 gap-2" onClick={handleConfirm}>
                        <Check size={18} /> Confirmar
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="w-full gap-2" 
                      disabled={isListening || isProcessing}
                      onClick={startListening}
                    >
                      <Mic size={18} /> {isListening ? 'Ouvindo...' : 'Falar Agora'}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceCommandFAB;

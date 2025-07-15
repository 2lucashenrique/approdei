
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Target, ArrowLeft } from 'lucide-react';
import { Settings as SettingsType } from '@/types';
import { formatCurrency } from '@/utils/calculations';

interface WeeklyGoalSettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: SettingsType) => void;
  onBack: () => void;
}

const WeeklyGoalSettings: React.FC<WeeklyGoalSettingsProps> = ({ settings, onUpdateSettings, onBack }) => {
  const [weeklyGoal, setWeeklyGoal] = useState((settings.weeklyGoal || 0).toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newWeeklyGoal = parseFloat(weeklyGoal) || 0;
    onUpdateSettings({ 
      ...settings, 
      weeklyGoal: newWeeklyGoal
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold">Meta Semanal</h2>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="weeklyGoal" className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                Meta Semanal de Ganhos (R$)
              </Label>
              <Input
                id="weeklyGoal"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(e.target.value)}
              />
              <p className="text-sm text-gray-600 mt-1">
                Defina sua meta de ganhos para a semana
              </p>
            </div>

            <Button type="submit" className="w-full">
              Salvar Meta
            </Button>
          </form>

          {settings.weeklyGoal && settings.weeklyGoal > 0 && (
            <div className="mt-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Meta Atual: {formatCurrency(settings.weeklyGoal)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyGoalSettings;

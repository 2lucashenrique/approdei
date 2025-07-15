
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PlatformTripSelectorProps {
  platforms: string[];
  tripsByPlatform: { [platform: string]: number };
  earningsByPlatform: { [platform: string]: number };
  onChange: (tripsByPlatform: { [platform: string]: number }) => void;
  onEarningsChange: (earningsByPlatform: { [platform: string]: number }) => void;
}

const PlatformTripSelector: React.FC<PlatformTripSelectorProps> = ({ 
  platforms, 
  tripsByPlatform, 
  earningsByPlatform,
  onChange,
  onEarningsChange
}) => {
  const handlePlatformChange = (platform: string, value: string) => {
    const numValue = parseInt(value) || 0;
    onChange({
      ...tripsByPlatform,
      [platform]: numValue
    });
  };

  const handleEarningsChange = (platform: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    onEarningsChange({
      ...earningsByPlatform,
      [platform]: numValue
    });
  };

  const totalTrips = Object.values(tripsByPlatform).reduce((sum, count) => sum + count, 0);
  const totalEarnings = Object.values(earningsByPlatform).reduce((sum, earnings) => sum + earnings, 0);

  if (platforms.length === 0) {
    return (
      <>
        <div>
          <Label htmlFor="tripCount">Quantidade de Corridas</Label>
          <Input
            id="tripCount"
            type="number"
            placeholder="0"
            value={totalTrips}
            onChange={(e) => onChange({ 'Geral': parseInt(e.target.value) || 0 })}
            required
          />
        </div>
        <div>
          <Label htmlFor="earnings">Ganhos (R$)</Label>
          <Input
            id="earnings"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={totalEarnings}
            onChange={(e) => onEarningsChange({ 'Geral': parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
      </>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Corridas e Ganhos por Plataforma</Label>
      <div className="grid grid-cols-1 gap-4">
        {platforms.map((platform) => (
          <div key={platform} className="p-4 border rounded-lg space-y-3">
            <h4 className="font-medium text-sm">{platform}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`platform-trips-${platform}`} className="text-xs">
                  Corridas
                </Label>
                <Input
                  id={`platform-trips-${platform}`}
                  type="number"
                  placeholder="0"
                  value={tripsByPlatform[platform] || ''}
                  onChange={(e) => handlePlatformChange(platform, e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`platform-earnings-${platform}`} className="text-xs">
                  Ganhos (R$)
                </Label>
                <Input
                  id={`platform-earnings-${platform}`}
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={earningsByPlatform[platform] || ''}
                  onChange={(e) => handleEarningsChange(platform, e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformTripSelector;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

interface PlatformManagerProps {
  platforms: string[];
  onUpdatePlatforms: (platforms: string[]) => void;
}

const PlatformManager: React.FC<PlatformManagerProps> = ({ platforms, onUpdatePlatforms }) => {
  const [newPlatform, setNewPlatform] = useState('');

  const handleAddPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlatform.trim() && !platforms.includes(newPlatform.trim())) {
      onUpdatePlatforms([...platforms, newPlatform.trim()]);
      setNewPlatform('');
    }
  };

  const handleRemovePlatform = (platformToRemove: string) => {
    onUpdatePlatforms(platforms.filter(platform => platform !== platformToRemove));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddPlatform} className="space-y-4">
        <div>
          <Label htmlFor="newPlatform">Nova Plataforma</Label>
          <div className="flex gap-2">
            <Input
              id="newPlatform"
              type="text"
              placeholder="Ex: Uber, 99, InDrive..."
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              required
            />
            <Button type="submit" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>

      <div className="space-y-2">
        <Label>Plataformas Cadastradas:</Label>
        {platforms.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma plataforma cadastrada</p>
        ) : (
          <div className="space-y-2">
            {platforms.map((platform, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{platform}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePlatform(platform)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformManager;

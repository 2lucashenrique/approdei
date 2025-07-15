
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Refuel, CrudActions } from '@/types';
import { formatCurrency, formatNumber } from '@/utils/calculations';
import { Edit, Trash2, Briefcase, User } from 'lucide-react';
import RefuelEditDialog from './RefuelEditDialog';

interface RefuelListProps {
  refuels: Refuel[];
  actions?: CrudActions<Refuel>;
}

const RefuelList: React.FC<RefuelListProps> = ({ refuels, actions }) => {
  const [editingRefuel, setEditingRefuel] = useState<Refuel | null>(null);

  const handleEdit = (refuel: Refuel) => {
    setEditingRefuel(refuel);
  };

  const handleSaveEdit = (updatedRefuel: Refuel) => {
    if (actions?.onEdit) {
      actions.onEdit(updatedRefuel);
    }
    setEditingRefuel(null);
  };

  const handleDelete = (id: string) => {
    if (actions?.onDelete && confirm('Tem certeza que deseja excluir este abastecimento?')) {
      actions.onDelete(id);
    }
  };

  if (refuels.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum abastecimento registrado ainda.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {refuels
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((refuel) => (
            <Card key={refuel.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-lg">{formatCurrency(refuel.totalValue)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(refuel.date).toLocaleDateString('pt-BR')}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {refuel.type === 'work' ? (
                        <Briefcase size={14} className="text-blue-600" />
                      ) : (
                        <User size={14} className="text-green-600" />
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        refuel.type === 'work' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {refuel.type === 'work' ? 'Trabalho' : 'Pessoal'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatNumber(refuel.liters)} L</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(refuel.pricePerLiter)}/L
                      </p>
                    </div>
                    {actions && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(refuel)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(refuel.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {editingRefuel && (
        <RefuelEditDialog
          refuel={editingRefuel}
          onSave={handleSaveEdit}
          onCancel={() => setEditingRefuel(null)}
        />
      )}
    </>
  );
};

export default RefuelList;

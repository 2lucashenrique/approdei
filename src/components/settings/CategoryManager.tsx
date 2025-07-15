
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

interface CategoryManagerProps {
  title: string;
  categories: string[];
  onUpdateCategories: (categories: string[]) => void;
  placeholder?: string;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  title, 
  categories, 
  onUpdateCategories, 
  placeholder = "Nova categoria..." 
}) => {
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      onUpdateCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    onUpdateCategories(categories.filter(category => category !== categoryToRemove));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddCategory} className="space-y-4">
        <div>
          <Label htmlFor={`new-category-${title}`}>Nova Categoria</Label>
          <div className="flex gap-2">
            <Input
              id={`new-category-${title}`}
              type="text"
              placeholder={placeholder}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              required
            />
            <Button type="submit" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>

      <div className="space-y-2">
        <Label>Categorias Cadastradas:</Label>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma categoria cadastrada</p>
        ) : (
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{category}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCategory(category)}
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

export default CategoryManager;

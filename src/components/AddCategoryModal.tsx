import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Folder } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AddCategoryModalProps {
  onCategoryAdded: () => void;
}

const colorOptions = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#84CC16', // Lime
  '#6366F1', // Indigo
];

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ onCategoryAdded }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: colorOptions[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          ...formData,
          user_id: user.id,
        });

      if (!error) {
        setFormData({
          name: '',
          description: '',
          color: colorOptions[0],
        });
        setIsOpen(false);
        onCategoryAdded();
      }
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="gradient-secondary hover:shadow-secondary transition-all duration-300 hover:scale-105 rounded-full w-14 h-14 shadow-lg"
      >
        <Plus size={20} />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Add New Category</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X size={16} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter category name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                    formData.color === color 
                      ? 'border-foreground shadow-lg' 
                      : 'border-border hover:border-foreground/50'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name}
              className="flex-1 gradient-primary text-white border-0"
            >
              {loading ? 'Adding...' : 'Add Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
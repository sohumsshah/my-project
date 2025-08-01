import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Folder, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getCategoryIcon } from '@/lib/categoryIcons';

interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
  video_count?: number;
}

interface CategoryCardProps {
  category: Category;
  onUpdate: () => void;
  onCategoryClick?: (categoryId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  onUpdate, 
  onCategoryClick 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user || !confirm(`Are you sure you want to delete the category "${category.name}"? This will also delete all videos in this category.`)) return;
    
    setLoading(true);
    try {
      // First delete all videos in this category
      await supabase
        .from('videos')
        .delete()
        .eq('category_id', category.id)
        .eq('user_id', user.id);

      // Then delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id)
        .eq('user_id', user.id);

      if (!error) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setLoading(false);
    }
  };

  const IconComponent = getCategoryIcon(category.name);

  return (
    <div 
      className="group bg-card rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden hover:scale-[1.02] cursor-pointer"
      onClick={() => onCategoryClick?.(category.id)}
    >
      {/* Header with category color */}
      <div 
        className="h-2 w-full"
        style={{ backgroundColor: category.color }}
      />
      
      <div className="p-4">
        {/* Category Icon and Name */}
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: category.color }}
          >
            <IconComponent size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-xs text-muted-foreground truncate">
                {category.description}
              </p>
            )}
          </div>
        </div>

        {/* Video Count */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Video size={12} />
          <span>{category.video_count || 0} videos</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCategoryClick?.(category.id);
            }}
            className="h-8 px-3 text-xs hover:text-primary"
          >
            View Videos
          </Button>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement edit functionality
                console.log('Edit category:', category.id);
              }}
              className="h-8 w-8 p-0 hover:text-primary"
            >
              <Edit size={14} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={loading}
              className="h-8 w-8 p-0 hover:text-destructive"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};

export default CategoryCard;
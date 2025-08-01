import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Zap, Link, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface QuickSaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sharedUrl?: string;
  onVideoAdded: () => void;
}

const QuickSaveModal: React.FC<QuickSaveModalProps> = ({ 
  open, 
  onOpenChange, 
  sharedUrl, 
  onVideoAdded 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    url: sharedUrl || '',
    platform: 'youtube' as 'instagram' | 'tiktok' | 'youtube',
    category_id: '',
  });

  useEffect(() => {
    if (open && user) {
      fetchCategories();
    }
  }, [open, user]);

  useEffect(() => {
    if (sharedUrl) {
      setFormData(prev => ({
        ...prev,
        url: sharedUrl,
        platform: detectPlatform(sharedUrl)
      }));
    }
  }, [sharedUrl]);

  const fetchCategories = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (!error && data) {
        setCategories(data);
        // Auto-select first category if available
        if (data.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const detectPlatform = (url: string): 'instagram' | 'tiktok' | 'youtube' => {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('tiktok.com')) return 'tiktok';
    return 'youtube';
  };

  const extractTitleFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      if (hostname.includes('youtube.com')) {
        return 'YouTube Video';
      } else if (hostname.includes('instagram.com')) {
        return 'Instagram Post';
      } else if (hostname.includes('tiktok.com')) {
        return 'TikTok Video';
      }
      
      return 'Saved Video';
    } catch {
      return 'Saved Video';
    }
  };

  const handleUrlChange = (url: string) => {
    const platform = detectPlatform(url);
    const suggestedTitle = formData.title || extractTitleFromUrl(url);
    
    setFormData(prev => ({
      ...prev,
      url,
      platform,
      title: suggestedTitle
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.url || !formData.category_id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('videos')
        .insert({
          title: formData.title || extractTitleFromUrl(formData.url),
          url: formData.url,
          platform: formData.platform,
          category_id: formData.category_id,
          user_id: user.id,
          is_favorite: false,
        });

      if (!error) {
        setFormData({
          title: '',
          url: '',
          platform: 'youtube',
          category_id: categories[0]?.id || '',
        });
        onOpenChange(false);
        onVideoAdded();
      }
    } catch (error) {
      console.error('Error saving video:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold">Quick Save</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <X size={16} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Video URL</label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                value={formData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="Paste video URL here"
                className="pl-10"
                type="url"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title (optional)</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Auto-generated or enter custom title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {categories.length === 0 && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <p>No categories found. Create a category first to organize your videos.</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.url || !formData.category_id}
              className="flex-1 gradient-primary text-white border-0 gap-2"
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Quick Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickSaveModal;
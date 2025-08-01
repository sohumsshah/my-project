import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Video, Wand2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { analyzeVideoFromUrl } from '@/lib/openai';

interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface AddVideoModalProps {
  categories: Category[];
  onVideoAdded: () => void;
}

const AddVideoModal: React.FC<AddVideoModalProps> = ({ categories, onVideoAdded }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    platform: 'youtube' as 'instagram' | 'tiktok' | 'youtube',
    creator_name: '',
    category_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title || !formData.url || !formData.category_id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('videos')
        .insert({
          ...formData,
          user_id: user.id,
          is_favorite: false,
        });

      if (!error) {
        setFormData({
          title: '',
          url: '',
          description: '',
          platform: 'youtube',
          creator_name: '',
          category_id: '',
        });
        setIsOpen(false);
        onVideoAdded();
      }
    } catch (error) {
      console.error('Error adding video:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectPlatform = (url: string): 'instagram' | 'tiktok' | 'youtube' => {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('tiktok.com')) return 'tiktok';
    return 'youtube';
  };

  const handleUrlChange = (url: string) => {
    setFormData(prev => ({
      ...prev,
      url,
      platform: detectPlatform(url)
    }));
  };

  const handleAIAnalysis = async () => {
    if (!formData.url) return;
    
    setAnalyzing(true);
    try {
      const analysis = await analyzeVideoFromUrl(formData.url);
      
      // Find category by name if it exists
      let categoryId = formData.category_id;
      if (analysis.category) {
        const matchingCategory = categories.find(cat => 
          cat.name.toLowerCase().includes(analysis.category?.toLowerCase() || '') ||
          analysis.category?.toLowerCase().includes(cat.name.toLowerCase())
        );
        if (matchingCategory) {
          categoryId = matchingCategory.id;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        title: analysis.title || prev.title,
        description: analysis.description || prev.description,
        category_id: categoryId,
      }));
    } catch (error) {
      console.error('Error analyzing video:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="gradient-primary hover:shadow-primary transition-all duration-300 hover:scale-105 gap-2 text-white border-0"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">Add Video</span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Add New Video</h2>
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
            <label className="block text-sm font-medium mb-2">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter video title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL *</label>
            <div className="flex gap-2">
              <Input
                value={formData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://..."
                type="url"
                required
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAIAnalysis}
                disabled={!formData.url || analyzing}
                variant="outline"
                size="sm"
                className="px-3 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {analyzing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Wand2 size={16} />
                )}
              </Button>
            </div>
            {analyzing && (
              <p className="text-xs text-muted-foreground mt-1">
                🤖 AI is analyzing the video...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
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
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Creator Name</label>
            <Input
              value={formData.creator_name}
              onChange={(e) => setFormData(prev => ({ ...prev, creator_name: e.target.value }))}
              placeholder="Creator or channel name"
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
            <label className="block text-sm font-medium mb-2">Platform</label>
            <Select
              value={formData.platform}
              onValueChange={(value: 'instagram' | 'tiktok' | 'youtube') => 
                setFormData(prev => ({ ...prev, platform: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
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
              disabled={loading || !formData.title || !formData.url || !formData.category_id}
              className="flex-1 gradient-primary text-white border-0"
            >
              {loading ? 'Adding...' : 'Add Video'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVideoModal;
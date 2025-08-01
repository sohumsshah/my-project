import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink, Trash2, Edit, Play, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface Video {
  id: string;
  title: string;
  url: string;
  description?: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  creator_name?: string;
  is_favorite: boolean;
  created_at: string;
  category_id: string;
  category: {
    name: string;
    color: string;
  };
}

interface VideoCardProps {
  video: Video;
  categories: Category[];
  onUpdate: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, categories, onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleToggleFavorite = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('videos')
        .update({ is_favorite: !video.is_favorite })
        .eq('id', video.id)
        .eq('user_id', user.id);

      if (!error) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !confirm('Are you sure you want to delete this video?')) return;
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', video.id)
        .eq('user_id', user.id);

      if (!error) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'youtube': return 'text-red-500';
      case 'instagram': return 'text-pink-500';
      case 'tiktok': return 'text-black dark:text-white';
      default: return 'text-gray-500';
    }
  };

  const getThumbnail = (url: string, platform: string) => {
    // Simple thumbnail logic - in a real app, you'd extract actual video thumbnails
    if (platform === 'youtube' && url.includes('watch?v=')) {
      const videoId = url.split('watch?v=')[1]?.split('&')[0];
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    return null;
  };

  const thumbnail = getThumbnail(video.url, video.platform);

  return (
    <div className="group bg-card rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden hover:scale-[1.02]">
      {/* Thumbnail or Placeholder */}
      <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={video.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`${thumbnail ? 'hidden' : 'flex'} items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20`}>
          <Play size={32} className="text-muted-foreground" />
        </div>
        
        {/* Platform Badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm ${getPlatformColor(video.platform)}`}>
            {video.platform.charAt(0).toUpperCase() + video.platform.slice(1)}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 right-2">
          <span 
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: video.category.color }}
          >
            {video.category.name}
          </span>
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleFavorite}
          disabled={loading}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          <Heart 
            size={16} 
            className={video.is_favorite ? 'text-red-500 fill-current' : 'text-muted-foreground'}
          />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        
        {video.creator_name && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <User size={12} />
            <span>{video.creator_name}</span>
          </div>
        )}

        {video.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {video.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {new Date(video.created_at).toLocaleDateString()}
          </span>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(video.url, '_blank')}
              className="h-8 w-8 p-0 hover:text-primary"
            >
              <ExternalLink size={14} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="h-8 w-8 p-0 hover:text-destructive"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
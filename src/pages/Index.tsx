import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, Heart, Grid, List, Share, Zap, LogOut, Trash2 } from 'lucide-react';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { Share as CapacitorShare } from '@capacitor/share';
import AddVideoModal from '@/components/AddVideoModal';
import AddCategoryModal from '@/components/AddCategoryModal';
import VideoCard from '@/components/VideoCard';
import QuickSaveModal from '@/components/QuickSaveModal';
import CategoryCard from '@/components/CategoryCard';
import { ThemeToggle } from '@/components/ThemeToggle';

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

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickSaveOpen, setQuickSaveOpen] = useState(false);
  const [sharedUrl, setSharedUrl] = useState<string>();
  const [showCategoryVideos, setShowCategoryVideos] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('categories');

  const fetchCategories = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchVideos = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        category:categories(name, color)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVideos(data as Video[]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchVideos();
    }
  }, [user?.id]);

  useEffect(() => {
    let filtered = videos;

    if (searchQuery) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.creator_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Auto-switch to videos tab if search results exist and we're on categories tab
      if (filtered.length > 0 && activeTab === 'categories') {
        setActiveTab('videos');
        const videosTab = document.querySelector('[value="videos"]') as HTMLButtonElement;
        if (videosTab) videosTab.click();
      }
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(video => video.category_id === selectedCategory);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(video => video.is_favorite);
    }

    setFilteredVideos(filtered);
  }, [videos, searchQuery, selectedCategory, showFavoritesOnly, activeTab]);

  const handleDataUpdate = () => {
    fetchCategories();
    fetchVideos();
  };

  const handleQuickSave = async () => {
    try {
      const result = await CapacitorShare.share({
        title: 'Share to InstaSave',
        text: 'Share this video to InstaSave',
        url: 'instasave://share',
        dialogTitle: 'Share with InstaSave'
      });
      
      if (result.activityType) {
        setQuickSaveOpen(true);
      }
    } catch (error) {
      // Fallback for web - just open the modal
      setQuickSaveOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-Optimized Header */}
      <header className="sticky top-0 z-50 border-b border-border gradient-secondary backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-secondary">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-primary">
              <Share className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              InstaSave
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground">
              {user.email}
            </span>
            <ThemeToggle />
            <Button
              onClick={handleQuickSave}
              size="sm"
              className="gradient-primary hover:shadow-primary transition-all duration-300 hover:scale-105 gap-1 px-3 text-white border-0"
            >
              <Zap size={14} className="animate-bounce-gentle" />
              <span className="hidden sm:inline">Quick Save</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="gap-1"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 pb-20 sm:pb-8">
        {/* Mobile-Optimized Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base border-2 focus:border-primary focus:shadow-primary transition-all duration-300"
            />
          </div>
        </div>

        {/* Modern Filter Bar with Category Icons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 animate-slide-up">
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            size="sm"
            className={`flex-shrink-0 transition-all duration-300 ${
              showFavoritesOnly 
                ? 'gradient-accent text-white border-0 shadow-accent' 
                : 'hover:border-accent hover:text-accent'
            }`}
          >
            <Heart size={14} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
          </Button>

          {/* Category Icon Filters */}
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.name);
            const isSelected = selectedCategory === category.id;
            return (
              <Button
                key={category.id}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(isSelected ? 'all' : category.id)}
                className={`flex-shrink-0 transition-all duration-300 hover:scale-105 ${
                  isSelected
                    ? 'gradient-primary text-white border-0 shadow-primary'
                    : 'hover:border-primary hover:text-primary hover:shadow-secondary'
                }`}
                title={category.name}
              >
                <IconComponent size={14} />
                <span className="hidden md:inline ml-1">{category.name}</span>
              </Button>
            );
          })}

          <div className="flex ml-auto gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'gradient-secondary shadow-secondary'
                  : 'hover:border-secondary hover:text-secondary'
              }`}
            >
              <Grid size={14} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`transition-all duration-300 ${
                viewMode === 'list'
                  ? 'gradient-secondary shadow-secondary'
                  : 'hover:border-secondary hover:text-secondary'
              }`}
            >
              <List size={14} />
            </Button>
          </div>
        </div>


        {/* Main Videos Content */}
        <div className="animate-slide-up">
          {filteredVideos.length === 0 ? (
            <div className="text-center py-16">
              <div className="animate-float mb-6">
                <p className="text-muted-foreground mb-6 text-lg">
                  {videos.length === 0 ? 'No videos saved yet.' : 'No videos match your filters.'}
                </p>
              </div>
              {videos.length === 0 && (
                <div className="space-y-4">
                  <Button
                    onClick={handleQuickSave}
                    size="lg"
                    className="gradient-primary hover:shadow-primary transition-all duration-300 hover:scale-105 gap-2 text-white border-0"
                  >
                    <Zap size={20} className="animate-bounce-gentle" />
                    Quick Save Your First Video
                  </Button>
                  <p className="text-sm text-muted-foreground">or</p>
                  <AddVideoModal categories={categories} onVideoAdded={handleDataUpdate} />
                </div>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-4'
            }>
              {filteredVideos.map((video, index) => (
                <div 
                  key={video.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <VideoCard video={video} categories={categories} onUpdate={handleDataUpdate} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 sm:hidden">
          <div className="animate-float">
            <AddCategoryModal onCategoryAdded={handleDataUpdate} />
          </div>
          <div className="animate-float" style={{ animationDelay: '0.5s' }}>
            <AddVideoModal categories={categories} onVideoAdded={handleDataUpdate} />
          </div>
        </div>
      </main>

      <QuickSaveModal
        open={quickSaveOpen}
        onOpenChange={setQuickSaveOpen}
        sharedUrl={sharedUrl}
        onVideoAdded={handleDataUpdate}
      />
    </div>
  );
};

export default Index;
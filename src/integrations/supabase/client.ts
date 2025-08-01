import { createClient } from '@supabase/supabase-js';

// These would typically come from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database type definitions for better TypeScript support
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          color: string;
          description: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          description?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          description?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          title: string;
          url: string;
          description: string | null;
          platform: 'instagram' | 'tiktok' | 'youtube';
          creator_name: string | null;
          is_favorite: boolean;
          category_id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          url: string;
          description?: string | null;
          platform: 'instagram' | 'tiktok' | 'youtube';
          creator_name?: string | null;
          is_favorite?: boolean;
          category_id: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          url?: string;
          description?: string | null;
          platform?: 'instagram' | 'tiktok' | 'youtube';
          creator_name?: string | null;
          is_favorite?: boolean;
          category_id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using direct values for GitHub Pages deployment
const supabaseUrl = 'https://uoptttcemrgukuvznfbx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcHR0dGNlbXJndWt1dnpuZmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDM4NDUsImV4cCI6MjA2OTU3OTg0NX0.Xow28Ha04y_tr1MlF3TLo7Anss5Div6U38s2rWV1GHQ';

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
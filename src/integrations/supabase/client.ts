import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using direct values for GitHub Pages deployment
const supabaseUrl = 'https://uoptttcemrgukuvznfbx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcHR0dGNlbXJndWt1dnpuZmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzE0MzEsImV4cCI6MjA1MTI0NzQzMX0.CqNhvWOCcJJrWBTx2Ac6ZTILy6lttONGS_6MbK-LXrU';

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
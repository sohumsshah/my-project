import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock authentication - simulate loading and setting a user
    const timer = setTimeout(() => {
      setUser({
        id: 'mock-user-id-123',
        email: 'user@example.com',
        user_metadata: {
          full_name: 'John Doe',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        }
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const signOut = async (): Promise<void> => {
    // Mock sign out
    setUser(null);
    setLoading(false);
    // In a real implementation, this would redirect to auth page
    console.log('User signed out');
  };

  return {
    user,
    loading,
    signOut,
  };
};
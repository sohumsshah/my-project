import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemPreference;
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Save theme preference
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0 hover:bg-accent hover:text-accent-foreground transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={16} className="transition-transform duration-300 rotate-0 hover:rotate-12" />
      ) : (
        <Sun size={16} className="transition-transform duration-300 rotate-0 hover:rotate-12" />
      )}
    </Button>
  );
};
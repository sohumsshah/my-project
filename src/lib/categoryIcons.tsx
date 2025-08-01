import { 
  Code, 
  Briefcase, 
  GraduationCap, 
  Music, 
  Gamepad2, 
  Heart, 
  Car, 
  Home, 
  Utensils, 
  Camera,
  Shirt,
  Dumbbell,
  Plane,
  Book,
  Palette,
  Users,
  Zap
} from 'lucide-react';

export const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('code') || name.includes('tech') || name.includes('programming')) return Code;
  if (name.includes('work') || name.includes('business') || name.includes('career')) return Briefcase;
  if (name.includes('education') || name.includes('learn') || name.includes('study')) return GraduationCap;
  if (name.includes('music') || name.includes('song') || name.includes('audio')) return Music;
  if (name.includes('game') || name.includes('gaming') || name.includes('play')) return Gamepad2;
  if (name.includes('health') || name.includes('wellness') || name.includes('medical')) return Heart;
  if (name.includes('car') || name.includes('auto') || name.includes('vehicle')) return Car;
  if (name.includes('home') || name.includes('house') || name.includes('decor')) return Home;
  if (name.includes('food') || name.includes('recipe') || name.includes('cooking')) return Utensils;
  if (name.includes('photo') || name.includes('camera') || name.includes('picture')) return Camera;
  if (name.includes('fashion') || name.includes('style') || name.includes('clothes')) return Shirt;
  if (name.includes('fitness') || name.includes('workout') || name.includes('exercise')) return Dumbbell;
  if (name.includes('travel') || name.includes('trip') || name.includes('vacation')) return Plane;
  if (name.includes('book') || name.includes('read') || name.includes('library')) return Book;
  if (name.includes('art') || name.includes('design') || name.includes('creative')) return Palette;
  if (name.includes('social') || name.includes('friend') || name.includes('people')) return Users;
  
  return Zap; // Default icon
};
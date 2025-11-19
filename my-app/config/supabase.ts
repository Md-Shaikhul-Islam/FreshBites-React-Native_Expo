import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// Supabase project configuration
// Get this from: https://app.supabase.com/ > Your Project > Settings > API
const supabaseUrl = 'https://xnsbgydseqmolumkjcny.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhuc2JneWRzZXFtb2x1bWtqY255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTU2NzQsImV4cCI6MjA3ODkzMTY3NH0.k-afu3llAr50KM9SuXYApZxU6ayvZteS6tCTumBggyg';

// Platform-specific storage configuration
const getStorageConfig = () => {
  if (Platform.OS === 'web') {
    // Use localStorage for web platform
    return {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
  }
  // Use AsyncStorage for React Native
  return AsyncStorage;
};

// Initialize Supabase client with platform-specific configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorageConfig(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

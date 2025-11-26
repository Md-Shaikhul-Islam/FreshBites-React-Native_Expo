import type { User } from '@/services/auth';
import { updateUser } from '@/services/auth';
import { registerBackgroundSync, unregisterBackgroundSync } from '@/services/background-sync';
import { registerDevice, unregisterDevice } from '@/services/device-registration';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type UserRole = 'normal' | 'premium' | 'manager';

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => Promise<void>;
  logout: () => Promise<void>;
  isPremium: boolean;
  setPremium: (value: boolean) => Promise<void>;
  userRole: UserRole;
  setUserRole: (role: UserRole) => Promise<void>;
  isManager: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  sandboxMode: boolean;
  setSandboxMode: (value: boolean) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'user:profile:v2';
const STORAGE_KEY_PREMIUM = 'user:isPremium:v1';
const STORAGE_KEY_ROLE = 'user:role:v1';

// In-memory fallback for Expo Go (when AsyncStorage native module is unavailable)
let memoryStore: { [key: string]: string } = {};

async function getAsyncStorage() {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    return AsyncStorage.default;
  } catch {
    // Fallback to in-memory storage in Expo Go
    return {
      getItem: async (key: string) => memoryStore[key] ?? null,
      setItem: async (key: string, value: string) => { memoryStore[key] = value; },
      removeItem: async (key: string) => { delete memoryStore[key]; },
    };
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [userRole, setUserRoleState] = useState<UserRole>('normal');
  const [loading, setLoading] = useState(true);
  const [sandboxMode, setSandboxMode] = useState(false);

  const isManager = userRole === 'manager';
  const isAuthenticated = user !== null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const storage = await getAsyncStorage();
        // Load user profile (AUTO-LOGIN)
        const userRaw = await storage.getItem(STORAGE_KEY_USER);
        if (userRaw && mounted) {
          const userData: User = JSON.parse(userRaw);
          console.log('🔐 Auto-login: User found in storage:', userData.username);
          setUserState(userData);
          setUserRoleState(userData.role);
          setIsPremium(userData.role === 'premium' || userData.role === 'manager');
          
          // Register background sync for this user
          console.log('📲 Registering background sync...');
          await registerBackgroundSync();
          console.log('✅ Auto-login complete');
        } else {
          console.log('⚠️ No saved user - login required');
        }
        
        // Fallback to old storage for backward compatibility
        if (!userRaw) {
          const premiumRaw = await storage.getItem(STORAGE_KEY_PREMIUM);
          const roleRaw = await storage.getItem(STORAGE_KEY_ROLE);
          if (!mounted) return;
          if (premiumRaw != null) setIsPremium(premiumRaw === '1');
          if (roleRaw != null) setUserRoleState(roleRaw as UserRole);
        }
      } catch (error) {
        console.error('❌ Error loading user:', error);
      }
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setUser = async (userData: User | null) => {
    setUserState(userData);
    if (userData) {
      setUserRoleState(userData.role);
      setIsPremium(userData.role === 'premium' || userData.role === 'manager');
      try {
        const storage = await getAsyncStorage();
        await storage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
        console.log('💾 User credentials saved to storage');
        
        // Register device for push notifications
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'granted') {
          const token = await Notifications.getExpoPushTokenAsync();
          await registerDevice(userData.id, token.data);
          console.log('✅ Device registered for user:', userData.id);
        } else {
          console.log('⚠️ Push notification permission not granted');
        }
        
        // Register background sync
        console.log('📲 Registering background sync...');
        await registerBackgroundSync();
        console.log('✅ Background sync registered');
      } catch (error) {
        console.error('❌ Error in setUser:', error);
      }
    } else {
      setUserRoleState('normal');
      setIsPremium(false);
    }
  };

  const logout = async () => {
    // Unregister background sync
    try {
      console.log('🔕 Unregistering background sync...');
      await unregisterBackgroundSync();
      console.log('✅ Background sync unregistered');
    } catch (error) {
      console.error('❌ Error unregistering background sync:', error);
    }
    
    // Unregister device before logging out
    try {
      await unregisterDevice();
      console.log('✅ Device unregistered');
    } catch (error) {
      console.error('❌ Error unregistering device:', error);
    }
    
    setUserState(null);
    setUserRoleState('normal');
    setIsPremium(false);
    try {
      const storage = await getAsyncStorage();
      await storage.removeItem(STORAGE_KEY_USER);
      await storage.removeItem(STORAGE_KEY_PREMIUM);
      await storage.removeItem(STORAGE_KEY_ROLE);
      console.log('🗑️ User credentials cleared from storage');
    } catch (error) {
      console.error('❌ Error clearing storage:', error);
    }
  };

  const setPremium = async (value: boolean) => {
    setIsPremium(value);
    const newRole: UserRole = value ? 'premium' : 'normal';
    
    if (value && userRole === 'normal') {
      setUserRoleState('premium');
    } else if (!value && userRole === 'premium') {
      setUserRoleState('normal');
    }
    
    // Update user object and database if user exists
    if (user) {
      const updatedUser: User = { ...user, role: newRole };
      await setUser(updatedUser);
      
      // Persist to database
      await updateUser(user.id, { role: newRole });
    }
    
    try {
      const storage = await getAsyncStorage();
      await storage.setItem(STORAGE_KEY_PREMIUM, value ? '1' : '0');
      await storage.setItem(STORAGE_KEY_ROLE, newRole);
    } catch {}
  };

  const setUserRole = async (role: UserRole) => {
    setUserRoleState(role);
    if (role === 'premium' || role === 'manager') {
      setIsPremium(true);
    } else {
      setIsPremium(false);
    }
    
    // Update user object and database if user exists
    if (user) {
      const updatedUser: User = { ...user, role };
      await setUser(updatedUser);
      
      // Persist to database
      await updateUser(user.id, { role });
    }
    
    try {
      const storage = await getAsyncStorage();
      await storage.setItem(STORAGE_KEY_ROLE, role);
      await storage.setItem(STORAGE_KEY_PREMIUM, (role === 'premium' || role === 'manager') ? '1' : '0');
    } catch {}
  };

  const value = useMemo(
    () => ({ 
      user,
      setUser,
      logout,
      isPremium, 
      setPremium, 
      userRole, 
      setUserRole, 
      isManager,
      isAuthenticated,
      loading, 
      sandboxMode, 
      setSandboxMode 
    }),
    [user, isPremium, userRole, isManager, isAuthenticated, loading, sandboxMode]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}


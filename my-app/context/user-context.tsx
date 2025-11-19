import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type UserRole = 'normal' | 'premium' | 'manager';

type UserContextType = {
  isPremium: boolean;
  setPremium: (value: boolean) => Promise<void>;
  userRole: UserRole;
  setUserRole: (role: UserRole) => Promise<void>;
  isManager: boolean;
  loading: boolean;
  sandboxMode: boolean;
  setSandboxMode: (value: boolean) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

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
    };
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [userRole, setUserRoleState] = useState<UserRole>('normal');
  const [loading, setLoading] = useState(true);
  const [sandboxMode, setSandboxMode] = useState(false);

  const isManager = userRole === 'manager';

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const storage = await getAsyncStorage();
        const premiumRaw = await storage.getItem(STORAGE_KEY_PREMIUM);
        const roleRaw = await storage.getItem(STORAGE_KEY_ROLE);
        if (!mounted) return;
        if (premiumRaw != null) setIsPremium(premiumRaw === '1');
        if (roleRaw != null) setUserRoleState(roleRaw as UserRole);
      } catch {}
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setPremium = async (value: boolean) => {
    setIsPremium(value);
    if (value && userRole === 'normal') {
      setUserRoleState('premium');
    } else if (!value && userRole === 'premium') {
      setUserRoleState('normal');
    }
    try {
      const storage = await getAsyncStorage();
      await storage.setItem(STORAGE_KEY_PREMIUM, value ? '1' : '0');
    } catch {}
  };

  const setUserRole = async (role: UserRole) => {
    setUserRoleState(role);
    if (role === 'premium' || role === 'manager') {
      setIsPremium(true);
    } else {
      setIsPremium(false);
    }
    try {
      const storage = await getAsyncStorage();
      await storage.setItem(STORAGE_KEY_ROLE, role);
      await storage.setItem(STORAGE_KEY_PREMIUM, (role === 'premium' || role === 'manager') ? '1' : '0');
    } catch {}
  };

  const value = useMemo(
    () => ({ isPremium, setPremium, userRole, setUserRole, isManager, loading, sandboxMode, setSandboxMode }),
    [isPremium, userRole, isManager, loading, sandboxMode]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}


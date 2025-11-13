import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type UserContextType = {
  isPremium: boolean;
  setPremium: (value: boolean) => Promise<void>;
  loading: boolean;
  sandboxMode: boolean;
  setSandboxMode: (value: boolean) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'user:isPremium:v1';

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
  const [loading, setLoading] = useState(true);
  const [sandboxMode, setSandboxMode] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const storage = await getAsyncStorage();
        const raw = await storage.getItem(STORAGE_KEY);
        if (!mounted) return;
        if (raw != null) setIsPremium(raw === '1');
      } catch {}
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setPremium = async (value: boolean) => {
    setIsPremium(value);
    try {
      const storage = await getAsyncStorage();
      await storage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch {}
  };

  const value = useMemo(() => ({ isPremium, setPremium, loading, sandboxMode, setSandboxMode }), [isPremium, loading, sandboxMode]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}


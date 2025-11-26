import { useUser } from '@/context/user-context';
import {
  getNotificationPreferences,
  isNotificationTypeEnabled,
  type NotificationPreferences
} from '@/services/notification-preferences';
import {
  registerForPushNotificationsAsync,
} from '@/services/notifications';
import {
  clearAllNotifications,
  fetchNotifications,
  markAllNotificationsAsRead as markAllSupabaseNotificationsAsRead,
  markNotificationAsRead as markSupabaseNotificationAsRead,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  type SupabaseNotification,
} from '@/services/supabase-notifications';
import type { RealtimeChannel } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface NotificationContextType {
  notifications: SupabaseNotification[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  expoPushToken: string | undefined;
}

// Helper to calculate unread count with preferences
function calculateUnreadCount(
  notifications: SupabaseNotification[], 
  preferences: NotificationPreferences
): number {
  return notifications.filter(n => 
    !n.is_read && isNotificationTypeEnabled(n.type, preferences)
  ).length;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<SupabaseNotification[]>([]);
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    product_added: true,
    product_removed: true,
    order_placed: true,
  });
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  // Initialize when user is available
  useEffect(() => {
    if (user?.id) {
      initializeNotifications();
    } else {
      // User logged out - clear everything
      setNotifications([]);
      if (realtimeChannel) {
        unsubscribeFromNotifications(realtimeChannel);
        setRealtimeChannel(null);
      }
    }

    return () => {
      if (realtimeChannel) {
        unsubscribeFromNotifications(realtimeChannel);
      }
    };
  }, [user?.id]);

  // Load preferences when user changes
  useEffect(() => {
    if (user?.id) {
      loadPreferences();
    }
  }, [user?.id]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [user?.id]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && user?.id) {
      console.log('📱 App came to foreground - refreshing notifications');
      await loadNotifications();
    }
  };

  const loadPreferences = async () => {
    if (!user?.id) {
      console.log('⚠️ No user - skipping preference load');
      setPreferences({
        product_added: true,
        product_removed: true,
        order_placed: true,
      });
      setPreferencesLoaded(false);
      return;
    }
    console.log('⚙️ Loading preferences for user:', user.id);
    const prefs = await getNotificationPreferences(user.id);
    setPreferences(prefs);
    setPreferencesLoaded(true);
    console.log('✅ Preferences loaded:', prefs);
  };

  const initializeNotifications = async () => {
    if (!user?.id) {
      console.log('⚠️ No user - skipping notification initialization');
      return;
    }

    console.log('🔔 Initializing notifications for user:', user.id);

    // Load preferences first
    await loadPreferences();

    // Load initial notifications
    await loadNotifications();

    // Subscribe to real-time updates
    const channel = subscribeToNotifications(user.id, (notification) => {
      console.log('📩 New notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);
    });
    setRealtimeChannel(channel);

    // Register for push notifications
    registerPushNotifications();
  };

  const loadNotifications = async () => {
    if (!user?.id) {
      console.log('⚠️ No user - skipping notification load');
      return;
    }

    console.log('📥 Loading notifications for user:', user.id);
    const notifs = await fetchNotifications(user.id);
    setNotifications(notifs);
    console.log(`✅ Loaded ${notifs.length} notifications`);
  };

  const registerPushNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        console.log('✅ Push notification token registered:', token);
      }
    } catch (error) {
      console.error('❌ Error registering push notifications:', error);
    }
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  const markAsRead = async (id: string) => {
    if (!user?.id) return;
    
    await markSupabaseNotificationAsRead(id, user.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    await markAllSupabaseNotificationsAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const clearAll = async () => {
    if (!user?.id) return;

    await clearAllNotifications(user.id);
    setNotifications([]);
  };

  const unreadCount = React.useMemo(() => {
    if (!user?.id) return 0;
    return calculateUnreadCount(notifications, preferences);
  }, [notifications, user?.id, preferences]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        clearAll,
        expoPushToken,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

import { supabase } from '@/config/supabase';
import {
    clearNotifications,
    getDeviceId,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    saveNotification,
    savePushToken,
    type NotificationItem
} from '@/services/notification-storage';
import {
    addNotificationReceivedListener,
    addNotificationResponseReceivedListener,
    registerForPushNotificationsAsync,
    scheduleLocalNotification,
} from '@/services/notifications';
import {
    fetchNotifications,
    markAllExistingNotificationsAsRead,
    markNotificationAsRead as markSupabaseNotificationAsRead,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    type SupabaseNotification,
} from '@/services/supabase-notifications';
import type { RealtimeChannel } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  expoPushToken: string | undefined;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [deviceId, setDeviceId] = useState<string>('');
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  // Load notifications on mount
  useEffect(() => {
    initializeNotifications();
    return () => {
      if (realtimeChannel) {
        unsubscribeFromNotifications(realtimeChannel);
      }
    };
  }, []);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [deviceId, realtimeChannel]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      console.log('📱 App came to foreground - refreshing data');
      // Refresh notifications when app comes to foreground
      if (deviceId) {
        await loadNotificationsWithDeviceId(deviceId);
      }
      
      // Ensure realtime connection is active
      if (realtimeChannel) {
        const status = realtimeChannel.state;
        if (status !== 'joined') {
          console.log('🔄 Reconnecting realtime channel...');
          // Reinitialize if connection was lost
          if (deviceId) {
            const channel = subscribeToNotifications((notif) => handleRealtimeNotification(notif, deviceId));
            setRealtimeChannel(channel);
          }
        }
      }
    }
  };

  const initializeNotifications = async () => {
    // Get or create persistent device ID
    const { deviceId: id, isNewDevice } = await getDeviceId();
    setDeviceId(id);
    console.log('📱 Using device ID:', id, 'New device:', isNewDevice);

    // If this is a new device, mark all existing notifications as read
    if (isNewDevice) {
      console.log('🆕 First install detected - marking all existing notifications as read');
      await markAllExistingNotificationsAsRead(id);
    }

    // Load initial notifications from Supabase
    await loadNotificationsWithDeviceId(id);

    // Subscribe to real-time updates - use closure to capture device ID
    const channel = subscribeToNotifications((notif) => handleRealtimeNotification(notif, id));
    setRealtimeChannel(channel);

    // Register for local notifications
    registerPushNotifications();
  };

  const handleRealtimeNotification = async (supabaseNotif: SupabaseNotification, currentDeviceId: string) => {
    console.log('📩 Real-time notification received:', supabaseNotif);
    
    // Check if this notification is already marked as read for this device (creator)
    const isReadByThisDevice = supabaseNotif.read_by && 
                                Array.isArray(supabaseNotif.read_by) && 
                                supabaseNotif.read_by.includes(currentDeviceId);
    
    console.log(`📱 Device ${currentDeviceId} - Notification read status:`, isReadByThisDevice);

    // Convert to local notification format
    const notification: NotificationItem = {
      id: supabaseNotif.id,
      type: supabaseNotif.type,
      productId: supabaseNotif.product_id,
      productTitle: supabaseNotif.product_title,
      productImage: supabaseNotif.product_image,
      timestamp: new Date(supabaseNotif.created_at).getTime(),
      // Mark as read if this device created it
      read: isReadByThisDevice,
    };

    // Show local push notification ONLY if NOT created by this device
    if (!isReadByThisDevice) {
      try {
        await scheduleLocalNotification(
          notification.type === 'product_added' ? '🎉 New Product Added!' : '🗑️ Product Removed',
          notification.productTitle,
          {
            notificationId: notification.id,
            productId: notification.productId,
            productTitle: notification.productTitle,
            type: notification.type,
          }
        );
        console.log('✅ Local push notification shown');
      } catch (error) {
        console.warn('⚠️ Could not show local notification:', error);
      }
    } else {
      console.log('🚫 Skipping notification - created by this device');
    }

    // Reload notifications list to show in UI
    await loadNotificationsWithDeviceId(currentDeviceId);
  };

  // Register for push notifications
  useEffect(() => {
    registerPushNotifications();

    // Listen for notifications when app is open
    const receivedSubscription = addNotificationReceivedListener((notification) => {
      console.log('📩 Notification received:', notification);
      // Just reload notifications list - they're already saved by data-manager
      loadNotifications();
    });

    // Listen for notification taps
    const responseSubscription = addNotificationResponseReceivedListener((response) => {
      console.log('👆 Notification tapped:', response);
      handleNotificationResponse(response);
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const loadNotificationsWithDeviceId = async (currentDeviceId: string) => {
    try {
      // Fetch from Supabase
      const supabaseNotifications = await fetchNotifications();
      
      // Convert to local format with correct read status based on THIS device only
      const converted: NotificationItem[] = supabaseNotifications.map(sn => {
        const isRead = (sn.read_by && Array.isArray(sn.read_by) && sn.read_by.includes(currentDeviceId)) || false;
        return {
          id: sn.id,
          type: sn.type,
          productId: sn.product_id,
          productTitle: sn.product_title,
          productImage: sn.product_image,
          timestamp: new Date(sn.created_at).getTime(),
          // Only mark as read if this specific device has read it
          read: isRead,
        };
      });

      setNotifications(converted);

      // Clear local cache and save fresh data
      await clearNotifications();
      for (const notif of converted) {
        await saveNotification(notif);
      }
      
      console.log(`✅ Loaded ${converted.length} notifications for device ${currentDeviceId}, ${converted.filter(n => !n.read).length} unread`);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to local storage
      const stored = await getNotifications();
      setNotifications(stored);
    }
  };

  const loadNotifications = async () => {
    // Ensure we have a device ID before loading
    if (!deviceId) {
      console.warn('⚠️ Device ID not initialized yet, getting it now...');
      const { deviceId: id } = await getDeviceId();
      setDeviceId(id);
      await loadNotificationsWithDeviceId(id);
    } else {
      await loadNotificationsWithDeviceId(deviceId);
    }
  };

  const registerPushNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        await savePushToken(token);
        await saveTokenToSupabase(token);
      } else {
        console.log('📱 Using local notifications only (Expo Go mode)');
      }
    } catch (error) {
      console.error('Error registering push notifications:', error);
    }
  };

  const saveTokenToSupabase = async (token: string) => {
    try {
      // Get device info
      const deviceId = token; // Using token as unique device ID for now
      
      const { error } = await supabase
        .from('user_devices')
        .upsert({
          device_id: deviceId,
          push_token: token,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'device_id',
        });

      if (error) {
        // Table might not exist yet - just log warning, don't crash
        console.warn('⚠️ Could not save token to Supabase (table may not exist):', error.message);
      } else {
        console.log('✅ Push token saved to Supabase');
      }
    } catch (error: any) {
      console.warn('⚠️ Error in saveTokenToSupabase:', error?.message || error);
    }
  };

  const handleIncomingNotification = async (notification: Notifications.Notification) => {
    const { data } = notification.request.content;
    
    // Create notification item from push data
    const notificationItem: NotificationItem = {
      id: notification.request.identifier,
      type: (data?.type as any) || 'product_added',
      productId: (data?.productId as string) || '',
      productTitle: (data?.productTitle as string) || notification.request.content.title || 'New Product',
      productImage: data?.productImage as string | undefined,
      timestamp: Date.now(),
      read: false,
    };

    await saveNotification(notificationItem);
    await loadNotifications();
  };

  const handleNotificationResponse = async (response: Notifications.NotificationResponse) => {
    const { data } = response.notification.request.content;
    const notificationId = response.notification.request.identifier;

    // Mark as read
    await markAsRead(notificationId);

    // Navigate to product (you can add navigation logic here)
    console.log('Navigate to product:', data?.productId);
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  const markAsRead = async (id: string) => {
    await markSupabaseNotificationAsRead(id, deviceId);
    await markNotificationAsRead(id);
    await loadNotifications();
  };

  const markAllAsRead = async () => {
    // Mark all in Supabase
    for (const notif of notifications) {
      await markSupabaseNotificationAsRead(notif.id, deviceId);
    }
    await markAllNotificationsAsRead();
    await loadNotifications();
  };

  const clearAll = async () => {
    await clearNotifications();
    await loadNotifications();
  };

  // Calculate unread count - only count notifications that are NOT read by this device
  const unreadCount = React.useMemo(() => {
    if (!deviceId) return 0;
    return notifications.filter(n => !n.read).length;
  }, [notifications, deviceId]);

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
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

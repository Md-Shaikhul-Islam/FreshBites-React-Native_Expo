/**
 * Background Notification Sync Service
 * Keeps notifications in sync even when app is in background
 */

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { fetchNotifications } from './supabase-notifications';

const BACKGROUND_NOTIFICATION_SYNC = 'background-notification-sync';

// Define the background task
TaskManager.defineTask(BACKGROUND_NOTIFICATION_SYNC, async () => {
  try {
    console.log('🔄 Background sync started');
    
    // Get stored user ID from AsyncStorage
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const storage = AsyncStorage.default;
    const userRaw = await storage.getItem('user:profile:v2');
    
    if (!userRaw) {
      console.log('⚠️ No user found - skipping background sync');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    const user = JSON.parse(userRaw);
    
    // Fetch latest notifications
    const notifications = await fetchNotifications(user.id, 20);
    console.log(`✅ Background sync: Fetched ${notifications.length} notifications`);
    
    // Check for new unread notifications
    const unreadCount = notifications.filter(n => !n.is_read).length;
    if (unreadCount > 0) {
      console.log(`📬 ${unreadCount} unread notifications`);
      // Update badge count
      // await Notifications.setBadgeCountAsync(unreadCount);
    }
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('❌ Error in background sync:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Register background fetch task
 */
export async function registerBackgroundSync(): Promise<boolean> {
  try {
    // Check if task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_SYNC);
    
    if (isRegistered) {
      console.log('✅ Background sync already registered');
      return true;
    }
    
    // Register the task
    await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_SYNC, {
      minimumInterval: 15 * 60, // 15 minutes (minimum allowed by iOS)
      stopOnTerminate: false, // Continue after app is closed
      startOnBoot: true, // Start on device boot
    });
    
    console.log('✅ Background sync registered successfully');
    return true;
  } catch (error) {
    console.error('❌ Error registering background sync:', error);
    return false;
  }
}

/**
 * Unregister background fetch task
 */
export async function unregisterBackgroundSync(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_SYNC);
    
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_NOTIFICATION_SYNC);
      console.log('✅ Background sync unregistered');
    }
  } catch (error) {
    console.error('❌ Error unregistering background sync:', error);
  }
}

/**
 * Get background fetch status
 */
export async function getBackgroundSyncStatus(): Promise<BackgroundFetch.BackgroundFetchStatus> {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    console.log('📊 Background sync status:', status);
    return status;
  } catch (error) {
    console.error('❌ Error getting background sync status:', error);
    return BackgroundFetch.BackgroundFetchStatus.Denied;
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = '@freshbites_notifications';
const SEEN_PRODUCTS_KEY = '@freshbites_seen_products';
const PUSH_TOKEN_KEY = '@freshbites_push_token';
const DEVICE_ID_KEY = '@freshbites_device_id';

export type NotificationType = 'product_added' | 'product_removed' | 'order_placed';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  productId: string;
  productTitle: string;
  productImage?: string;
  timestamp: number;
  read: boolean;
  creatorName?: string;
  creatorEmail?: string;
  customerName?: string;  // For order notifications - who placed the order
}

/**
 * Get all notifications
 */
export async function getNotifications(): Promise<NotificationItem[]> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

/**
 * Save notification
 */
export async function saveNotification(notification: NotificationItem): Promise<void> {
  try {
    const notifications = await getNotifications();
    notifications.unshift(notification); // Add to beginning
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notification:', error);
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notifications = await getNotifications();
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    const notifications = await getNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

/**
 * Clear all notifications
 */
export async function clearNotifications(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}

/**
 * Get list of product IDs user has seen (for detecting new products)
 */
export async function getSeenProductIds(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(SEEN_PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting seen products:', error);
    return [];
  }
}

/**
 * Update seen product IDs
 */
export async function updateSeenProductIds(productIds: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SEEN_PRODUCTS_KEY, JSON.stringify(productIds));
  } catch (error) {
    console.error('Error updating seen products:', error);
  }
}

/**
 * Save push token
 */
export async function savePushToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving push token:', error);
  }
}

/**
 * Get push token
 */
export async function getPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Get or create persistent device ID
 * Returns device ID and whether it's a new device
 */
export async function getDeviceId(): Promise<{ deviceId: string; isNewDevice: boolean }> {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    let isNewDevice = false;
    
    if (!deviceId) {
      // Create new device ID and save it
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      isNewDevice = true;
      console.log('📱 Created new device ID:', deviceId);
    }
    
    return { deviceId, isNewDevice };
  } catch (error) {
    console.error('Error getting device ID:', error);
    return { deviceId: `device_${Date.now()}`, isNewDevice: true };
  }
}

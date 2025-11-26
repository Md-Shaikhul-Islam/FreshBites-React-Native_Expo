import { supabase } from '../config/supabase';

export interface NotificationPreferences {
  product_added: boolean;
  product_removed: boolean;
  order_placed: boolean;
}

// Default: all notification types enabled
const DEFAULT_PREFERENCES: NotificationPreferences = {
  product_added: true,
  product_removed: true,
  order_placed: true,
};

/**
 * Get user's notification preferences from database
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('notification_preferences')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error getting notification preferences:', error);
      return DEFAULT_PREFERENCES;
    }

    if (data?.notification_preferences) {
      return { ...DEFAULT_PREFERENCES, ...data.notification_preferences };
    }
    
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('❌ Error getting notification preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save user's notification preferences to database
 */
export async function saveNotificationPreferences(
  userId: string,
  preferences: NotificationPreferences
): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ notification_preferences: preferences })
      .eq('id', userId);

    if (error) {
      console.error('❌ Error saving notification preferences:', error);
      throw error;
    }
    
    console.log('✅ Notification preferences saved to DB:', preferences);
  } catch (error) {
    console.error('❌ Error saving notification preferences:', error);
    throw error;
  }
}

/**
 * Check if a notification type is enabled
 */
export function isNotificationTypeEnabled(
  type: string,
  preferences: NotificationPreferences
): boolean {
  if (type === 'product_added') return preferences.product_added;
  if (type === 'product_removed') return preferences.product_removed;
  if (type === 'order_placed') return preferences.order_placed;
  return true; // Unknown types are shown by default
}

/**
 * Reset preferences to default (saves default to database)
 */
export async function resetNotificationPreferences(userId: string): Promise<void> {
  try {
    await saveNotificationPreferences(userId, DEFAULT_PREFERENCES);
    console.log('✅ Notification preferences reset to default');
  } catch (error) {
    console.error('❌ Error resetting notification preferences:', error);
  }
}

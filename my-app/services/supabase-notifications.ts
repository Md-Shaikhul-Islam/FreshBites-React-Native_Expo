import { supabase } from '@/config/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type NotificationType = 'product_added' | 'product_removed' | 'order_placed';

export interface SupabaseNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  product_id: string;
  product_title: string;
  product_image?: string;
  customer_name?: string; // For order notifications
  is_read: boolean;
  created_by_user?: string; // Who triggered the notification
  created_at: string;
  updated_at: string;
}

/**
 * Fetch notifications for a specific user
 * Much simpler now - just query by user_id!
 */
export async function fetchNotifications(userId: string, limit = 50): Promise<SupabaseNotification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching notifications:', error);
      return [];
    }

    console.log(`✅ Fetched ${data?.length || 0} notifications for user ${userId}`);
    return data || [];
  } catch (error) {
    console.error('❌ Error in fetchNotifications:', error);
    return [];
  }
}

/**
 * Subscribe to real-time notifications for a specific user
 */
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: SupabaseNotification) => void
): RealtimeChannel {
  console.log('🔔 Subscribing to notifications for user:', userId);

  const channel = supabase
    .channel(`notifications:user_id=eq.${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('📩 New notification received:', payload.new);
        onNotification(payload.new as SupabaseNotification);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from notifications
 */
export function unsubscribeFromNotifications(channel: RealtimeChannel): void {
  console.log('🔕 Unsubscribing from notifications');
  channel.unsubscribe();
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }

    console.log('✅ Marked notification as read:', notificationId);
  } catch (error) {
    console.error('❌ Error in markNotificationAsRead:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }

    console.log('✅ Marked all notifications as read for user:', userId);
  } catch (error) {
    console.error('❌ Error in markAllNotificationsAsRead:', error);
    throw error;
  }
}

/**
 * Clear all notifications for a user
 */
export async function clearAllNotifications(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error clearing notifications:', error);
      throw error;
    }

    console.log('✅ Cleared all notifications for user:', userId);
  } catch (error) {
    console.error('❌ Error in clearAllNotifications:', error);
    throw error;
  }
}

/**
 * Get unread count for a user (optionally filtered by preferences)
 */
export async function getUnreadCount(
  userId: string,
  preferences?: { product_added: boolean; product_removed: boolean; order_placed: boolean }
): Promise<number> {
  try {
    let query = supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    // Apply preference filters if provided
    if (preferences) {
      const enabledTypes: string[] = [];
      if (preferences.product_added) enabledTypes.push('product_added');
      if (preferences.product_removed) enabledTypes.push('product_removed');
      if (preferences.order_placed) enabledTypes.push('order_placed');

      if (enabledTypes.length > 0) {
        query = query.in('type', enabledTypes);
      } else {
        // If all types disabled, return 0
        return 0;
      }
    }

    const { count, error } = await query;

    if (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('❌ Error in getUnreadCount:', error);
    return 0;
  }
}

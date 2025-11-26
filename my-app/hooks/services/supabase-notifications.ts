import { supabase } from '@/config/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type NotificationType = 'product_added' | 'product_removed' | 'order_placed';

export interface SupabaseNotification {
  id: string;
  type: NotificationType;
  product_id: string;
  product_title: string;
  product_image?: string;
  created_at: string;
  read_by: string[];
  created_by_user?: string; // User ID who created the notification
  creator_name?: string; // Creator's name from users table (for product notifications)
  creator_email?: string; // Creator's email from users table
  customer_name?: string; // Customer name (for order notifications - who placed order)
}

/**
 * Fetch recent notifications from Supabase
 * For product_added/removed - show to everyone
 * For order_placed - show ONLY to the creator (filter by userId)
 */
export async function fetchNotifications(userId?: string, limit = 50): Promise<SupabaseNotification[]> {
  try {
    let query = supabase
      .from('notifications')
      .select(`
        *,
        creator:created_by_user (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // If userId provided, filter order notifications
    // Show all non-order notifications OR order notifications where creator = userId
    if (userId) {
      query = query.or(`type.neq.order_placed,created_by_user.eq.${userId}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    // Map the joined creator data
    const notifications = (data || []).map(item => ({
      ...item,
      creator_name: item.creator?.name,
      creator_email: item.creator?.email,
      creator: undefined, // Remove nested object
    }));

    return notifications;
  } catch (error) {
    console.error('Error in fetchNotifications:', error);
    return [];
  }
}

/**
 * Mark notification as read for current device
 */
export async function markNotificationAsRead(notificationId: string, deviceId: string): Promise<void> {
  try {
    // Get current notification
    const { data: notification } = await supabase
      .from('notifications')
      .select('read_by')
      .eq('id', notificationId)
      .single();

    if (!notification) return;

    // Add device to read_by array if not already there
    const readBy = notification.read_by || [];
    if (!readBy.includes(deviceId)) {
      readBy.push(deviceId);

      const { error } = await supabase
        .from('notifications')
        .update({ read_by: readBy })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
  }
}

/**
 * Subscribe to real-time notification changes
 */
export function subscribeToNotifications(
  callback: (notification: SupabaseNotification) => void
): RealtimeChannel {
  const channel = supabase
    .channel('notifications-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      },
      (payload) => {
        console.log('📩 New notification received:', payload.new);
        callback(payload.new as SupabaseNotification);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Subscribed to notifications');
      } else {
        console.log('📡 Subscription status:', status);
      }
    });

  return channel;
}

/**
 * Unsubscribe from notifications
 */
export async function unsubscribeFromNotifications(channel: RealtimeChannel): Promise<void> {
  await supabase.removeChannel(channel);
}

/**
 * Mark all existing notifications as read for a new device (first install)
 */
export async function markAllExistingNotificationsAsRead(deviceId: string): Promise<void> {
  try {
    console.log('📝 Marking all existing notifications as read for new device:', deviceId);
    
    // Get all notifications
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('id, read_by');

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError);
      return;
    }

    if (!notifications || notifications.length === 0) {
      console.log('No notifications to mark as read');
      return;
    }

    // Update each notification to include this device in read_by
    for (const notif of notifications) {
      const readBy = notif.read_by || [];
      if (!readBy.includes(deviceId)) {
        readBy.push(deviceId);
        
        await supabase
          .from('notifications')
          .update({ read_by: readBy })
          .eq('id', notif.id);
      }
    }

    console.log(`✅ Marked ${notifications.length} notifications as read for new device`);
  } catch (error) {
    console.error('Error in markAllExistingNotificationsAsRead:', error);
  }
}

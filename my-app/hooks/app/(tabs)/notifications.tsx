import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useNotifications } from '@/context/notification-context';
import { useUser } from '@/context/user-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getNotificationPreferences,
  isNotificationTypeEnabled,
  saveNotificationPreferences,
  type NotificationPreferences
} from '@/services/notification-preferences';
import type { NotificationItem } from '@/services/notification-storage';

type FilterType = 'all' | 'added' | 'removed' | 'ordered';
type FilterStatus = 'all' | 'read' | 'unread';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { user } = useUser();
  const { notifications, unreadCount, refreshNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [refreshing, setRefreshing] = React.useState(false);
  const [filterType, setFilterType] = React.useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = React.useState<FilterStatus>('all');
  const [preferences, setPreferences] = React.useState<NotificationPreferences>({
    product_added: true,
    product_removed: true,
    order_placed: true,
  });
  const [showPreferences, setShowPreferences] = React.useState(false);

  // Load preferences when screen mounts or user changes
  React.useEffect(() => {
    if (user?.id) {
      loadPreferences();
    }
  }, [user?.id]);

  // Also reload preferences when screen comes into focus
  React.useEffect(() => {
    const loadOnFocus = async () => {
      if (user?.id) {
        console.log('📱 Notifications screen focused - reloading preferences');
        await loadPreferences();
      }
    };
    loadOnFocus();
  }, [notifications]); // Reload when notifications change

  const loadPreferences = async () => {
    if (!user?.id) return;
    console.log('⚙️ Loading preferences in notifications screen for user:', user.id);
    const prefs = await getNotificationPreferences(user.id);
    setPreferences(prefs);
    console.log('✅ Preferences loaded in notifications screen:', prefs);
  };

  const togglePreference = async (key: keyof NotificationPreferences) => {
    if (!user?.id) return;
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    await saveNotificationPreferences(user.id, newPrefs);
    // Refresh notifications after preference change
    await refreshNotifications();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Reload preferences first, then notifications
    if (user?.id) {
      await loadPreferences();
    }
    await refreshNotifications();
    setRefreshing(false);
  };

  // Filter notifications based on type, status, and preferences
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter(notif => {
      // Filter by user preferences (most important)
      if (!isNotificationTypeEnabled(notif.type, preferences)) return false;
      
      // Filter by type
      if (filterType === 'added' && notif.type !== 'product_added') return false;
      if (filterType === 'removed' && notif.type !== 'product_removed') return false;
      if (filterType === 'ordered' && notif.type !== 'order_placed') return false;
      
      // Filter by status
      if (filterStatus === 'read' && !notif.read) return false;
      if (filterStatus === 'unread' && notif.read) return false;
      
      return true;
    });
  }, [notifications, filterType, filterStatus, preferences]);

  const handleNotificationPress = async (notification: NotificationItem) => {
    // Mark as read
    await markAsRead(notification.id);

    // Navigate based on type
    if (notification.type === 'product_added') {
      // Navigate to shop and highlight the product
      router.push('/(tabs)/shop');
    } else if (notification.type === 'product_removed') {
      // Just mark as read, product is removed
    }
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => {
    // Determine notification type and display text
    const isAdded = item.type === 'product_added';
    const isRemoved = item.type === 'product_removed';
    const isOrder = item.type === 'order_placed';
    
    let actionText = '';
    let iconBgColor = '#10b981'; // default green
    let iconSymbol = '+';
    
    if (isOrder) {
      actionText = '🛒 Item Ordered';
      iconBgColor = '#3b82f6'; // blue for orders
      iconSymbol = '🛒';
    } else if (isAdded) {
      actionText = 'New Product Added';
      iconBgColor = '#10b981'; // green
      iconSymbol = '+';
    } else if (isRemoved) {
      actionText = 'Product Removed';
      iconBgColor = '#ef4444'; // red
      iconSymbol = '×';
    }
    
    const bgColor = item.read ? colors.card : colors.tint + '15';

    return (
      <Pressable
        onPress={() => handleNotificationPress(item)}
        style={[styles.notificationItem, { backgroundColor: bgColor }]}
      >
        <View style={styles.iconContainer}>
          {item.productImage && !isOrder ? (
                  <Image 
                    source={{ uri: item.productImage }} 
                    style={styles.productImage}
                    defaultSource={require('@/assets/images/icon.png')}
                    resizeMode="contain" /* show full notification image */
                  />
          ) : (
            <View style={[styles.placeholderIcon, { backgroundColor: iconBgColor }]}>
              <ThemedText style={{ fontSize: 20, color: '#fff' }}>{iconSymbol}</ThemedText>
            </View>
          )}
        </View>
        <View style={styles.contentContainer}>
          <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
            {actionText}
          </ThemedText>
          <ThemedText style={{ color: colors.text, marginTop: 4 }}>
            {item.productTitle}
          </ThemedText>
          {item.creatorName && (
            <ThemedText style={{ color: colors.text, opacity: 0.6, fontSize: 11, marginTop: 2 }}>
              👤 {isOrder ? 'Ordered by' : 'By'}: {item.creatorName}
            </ThemedText>
          )}
          <ThemedText style={{ color: colors.text, opacity: 0.5, fontSize: 12, marginTop: 4 }}>
            {new Date(item.timestamp).toLocaleString()}
          </ThemedText>
        </View>
        {!item.read && (
          <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />
        )}
      </Pressable>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={{ fontSize: 64, marginBottom: 16 }}>🔔</ThemedText>
      <ThemedText type="subtitle" style={{ color: colors.text, opacity: 0.7 }}>
        No notifications yet
      </ThemedText>
      <ThemedText style={{ color: colors.text, opacity: 0.5, marginTop: 8, textAlign: 'center' }}>
        You'll be notified when products are added or removed
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header Actions */}
      {notifications.length > 0 && unreadCount > 0 && (
        <View style={[styles.headerActions, { backgroundColor: colors.card }]}>
          <Pressable
            onPress={markAllAsRead}
            style={styles.actionButton}
          >
            <ThemedText style={{ color: colors.tint }}>
              ✓ Mark all as read
            </ThemedText>
          </Pressable>
        </View>
      )}

      {/* Notification Preferences */}
      <View style={[styles.preferencesContainer, { backgroundColor: colors.card }]}>
        <Pressable 
          onPress={() => setShowPreferences(!showPreferences)}
          style={styles.preferencesHeader}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ThemedText style={{ fontSize: 18, marginRight: 8 }}>⚙️</ThemedText>
            <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
              Notification Settings
            </ThemedText>
          </View>
          <ThemedText style={{ color: colors.text, opacity: 0.7 }}>
            {showPreferences ? '▼' : '▶'}
          </ThemedText>
        </Pressable>
        
        {showPreferences && (
          <View style={styles.preferencesContent}>
            <ThemedText style={{ fontSize: 12, color: colors.text, opacity: 0.7, marginBottom: 12 }}>
              Choose which notifications you want to receive:
            </ThemedText>
            
            {/* Product Added */}
            <View style={styles.preferenceItem}>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
                  ✅ Product Added
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: colors.text, opacity: 0.6, marginTop: 2 }}>
                  When new products are added to the shop
                </ThemedText>
              </View>
              <Switch
                value={preferences.product_added}
                onValueChange={() => togglePreference('product_added')}
                trackColor={{ false: '#767577', true: colors.success }}
                thumbColor={preferences.product_added ? '#fff' : '#f4f3f4'}
              />
            </View>

            {/* Product Removed */}
            <View style={styles.preferenceItem}>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
                  ❌ Product Removed
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: colors.text, opacity: 0.6, marginTop: 2 }}>
                  When products are removed from the shop
                </ThemedText>
              </View>
              <Switch
                value={preferences.product_removed}
                onValueChange={() => togglePreference('product_removed')}
                trackColor={{ false: '#767577', true: colors.success }}
                thumbColor={preferences.product_removed ? '#fff' : '#f4f3f4'}
              />
            </View>

            {/* Order Placed */}
            <View style={styles.preferenceItem}>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
                  🛒 Order Notifications
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: colors.text, opacity: 0.6, marginTop: 2 }}>
                  When orders are placed (for managers)
                </ThemedText>
              </View>
              <Switch
                value={preferences.order_placed}
                onValueChange={() => togglePreference('order_placed')}
                trackColor={{ false: '#767577', true: colors.success }}
                thumbColor={preferences.order_placed ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        )}
      </View>

      {/* Filter Controls */}
      {notifications.length > 0 && (
        <View style={[styles.filterContainer, { backgroundColor: colors.background }]}>
          {/* Type Filters */}
          <View style={styles.filterRow}>
            <ThemedText style={{ fontSize: 12, opacity: 0.7, marginRight: 8 }}>Type:</ThemedText>
            <View style={styles.filterButtons}>
              <Pressable
                onPress={() => setFilterType('all')}
                style={[
                  styles.filterButton,
                  { backgroundColor: filterType === 'all' ? colors.tint : colors.card }
                ]}
              >
                <ThemedText style={{ fontSize: 12, color: filterType === 'all' ? '#fff' : colors.text }}>
                  All
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setFilterType('added')}
                style={[
                  styles.filterButton,
                  { backgroundColor: filterType === 'added' ? colors.tint : colors.card }
                ]}
              >
                <ThemedText style={{ fontSize: 12, color: filterType === 'added' ? '#fff' : colors.text }}>
                  Added
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setFilterType('removed')}
                style={[
                  styles.filterButton,
                  { backgroundColor: filterType === 'removed' ? colors.tint : colors.card }
                ]}
              >
                <ThemedText style={{ fontSize: 12, color: filterType === 'removed' ? '#fff' : colors.text }}>
                  Removed
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setFilterType('ordered')}
                style={[
                  styles.filterButton,
                  { backgroundColor: filterType === 'ordered' ? colors.tint : colors.card }
                ]}
              >
                <ThemedText style={{ fontSize: 12, color: filterType === 'ordered' ? '#fff' : colors.text }}>
                  Ordered
                </ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Status Filters */}
          <View style={styles.filterRow}>
            <ThemedText style={{ fontSize: 12, opacity: 0.7, marginRight: 8 }}>Status:</ThemedText>
            <View style={styles.filterButtons}>
              <Pressable
                onPress={() => setFilterStatus('all')}
                style={[
                  styles.filterButton,
                  { backgroundColor: filterStatus === 'all' ? colors.tint : colors.card }
                ]}
              >
                <ThemedText style={{ fontSize: 12, color: filterStatus === 'all' ? '#fff' : colors.text }}>
                  All
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setFilterStatus('unread')}
                style={[
                  styles.filterButton,
                  { backgroundColor: filterStatus === 'unread' ? colors.tint : colors.card }
                ]}
              >
                <ThemedText style={{ fontSize: 12, color: filterStatus === 'unread' ? '#fff' : colors.text }}>
                  Unread
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setFilterStatus('read')}
                style={[
                  styles.filterButton,
                  { backgroundColor: filterStatus === 'read' ? colors.tint : colors.card }
                ]}
              >
                <ThemedText style={{ fontSize: 12, color: filterStatus === 'read' ? '#fff' : colors.text }}>
                  Read
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={notifications.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filterContainer: {
    padding: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  list: {
    padding: 16,
    paddingBottom: 100, // Extra padding for tab bar
  },
  emptyList: {
    flex: 1,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  preferencesContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  preferencesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  preferencesContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
});

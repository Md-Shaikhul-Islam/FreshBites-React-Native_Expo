import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useNotifications } from '@/context/notification-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { NotificationItem } from '@/services/notification-storage';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { notifications, unreadCount, refreshNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

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
    const isAdded = item.type === 'product_added';
    const actionText = isAdded ? 'New Product Added' : 'Product Removed';
    const bgColor = item.read ? colors.card : colors.tint + '15';

    return (
      <Pressable
        onPress={() => handleNotificationPress(item)}
        style={[styles.notificationItem, { backgroundColor: bgColor }]}
      >
        <View style={styles.iconContainer}>
          {item.productImage ? (
            <Image 
              source={{ uri: item.productImage }} 
              style={styles.productImage}
              defaultSource={require('@/assets/images/icon.png')}
            />
          ) : (
            <View style={[styles.placeholderIcon, { backgroundColor: isAdded ? '#10b981' : '#ef4444' }]}>
              <ThemedText style={{ fontSize: 20, color: '#fff' }}>{isAdded ? '+' : '×'}</ThemedText>
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

      {/* Notifications List */}
      <FlatList
        data={notifications}
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
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
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
});

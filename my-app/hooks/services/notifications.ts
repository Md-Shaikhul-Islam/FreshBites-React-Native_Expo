import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is in foreground
// This ensures notifications ALWAYS show even when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,      // Show alert popup even when app is in foreground
    shouldPlaySound: true,       // Play notification sound
    shouldSetBadge: true,        // Update app badge
    shouldShowBanner: true,      // Show banner notification
    shouldShowList: true,        // Add to notification list
    priority: Notifications.AndroidNotificationPriority.MAX, // Maximum priority for Android
  }),
});

/**
 * Register for push notifications and get Expo Push Token
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Platform.OS === 'android') {
    // Configure notification channel with maximum priority
    await Notifications.setNotificationChannelAsync('default', {
      name: 'FreshBites Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10b981',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
      enableLights: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
    console.log('✅ Android notification channel configured');
  }

  // Skip push token registration to avoid Expo Go warning
  // Only get permissions for local notifications
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('Notification permissions not granted');
    return undefined;
  }

  console.log('✅ Local notification permissions granted');
  return undefined; // Return undefined to skip push token logic
}

/**
 * Add listener for when notification is received while app is open
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for when user taps on notification
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Show immediately
  });
}

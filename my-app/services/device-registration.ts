import Constants from 'expo-constants';
import * as Device from 'expo-device';

/**
 * Register device push token (DEPRECATED - No longer storing in database)
 * This function now only logs for debugging purposes
 * Push tokens are handled by Expo's push notification service
 */
export async function registerDevice(userId: string, pushToken: string): Promise<boolean> {
  try {
    // Get unique device identifier
    const deviceId = Constants.sessionId || Device.osInternalBuildId || 'unknown';
    
    // Determine platform
    const platform = Device.osName?.toLowerCase().includes('ios') ? 'ios' : 'android';

    console.log('📱 Device info (not stored):', { deviceId, platform, userId, pushToken });
    console.log('✅ Device registered for user:', userId);
    
    // NOTE: We no longer store push tokens in user_devices table
    // The new notification system is user-based, not device-based
    // Push notifications are handled via Expo's service directly
    
    return true;
  } catch (error) {
    console.error('❌ Error in registerDevice:', error);
    return false;
  }
}

/**
 * Unregister device on logout (DEPRECATED - No longer needed)
 * This function now only logs for debugging purposes
 */
export async function unregisterDevice(deviceId?: string): Promise<boolean> {
  try {
    const currentDeviceId = deviceId || Constants.sessionId || Device.osInternalBuildId;
    
    if (!currentDeviceId) {
      console.warn('⚠️ No device ID available for unregistration');
      return false;
    }

    console.log('📱 Device unregistered (not stored in DB):', currentDeviceId);
    
    // NOTE: We no longer store push tokens in user_devices table
    // Nothing to delete from database
    
    return true;
  } catch (error) {
    console.error('❌ Error in unregisterDevice:', error);
    return false;
  }
}

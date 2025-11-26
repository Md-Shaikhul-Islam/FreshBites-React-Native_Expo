import { supabase } from '@/config/supabase';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

/**
 * Register device push token in Supabase
 * This allows Edge Functions to send push notifications directly
 */
export async function registerDevice(userId: string, pushToken: string): Promise<boolean> {
  try {
    // Get unique device identifier
    const deviceId = Constants.sessionId || Device.osInternalBuildId || 'unknown';
    
    // Determine platform
    const platform = Device.osName?.toLowerCase().includes('ios') ? 'ios' : 'android';

    console.log('📱 Registering device:', { deviceId, platform, userId });

    // Upsert device information
    const { error } = await supabase
      .from('user_devices')
      .upsert({
        user_id: userId,
        device_id: deviceId,
        push_token: pushToken,
        platform: platform,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'device_id'
      });

    if (error) {
      console.error('❌ Error registering device:', error);
      return false;
    }

    console.log('✅ Device registered successfully');
    return true;
  } catch (error) {
    console.error('❌ Error in registerDevice:', error);
    return false;
  }
}

/**
 * Unregister device on logout
 */
export async function unregisterDevice(deviceId?: string): Promise<boolean> {
  try {
    const currentDeviceId = deviceId || Constants.sessionId || Device.osInternalBuildId;
    
    if (!currentDeviceId) {
      console.warn('⚠️ No device ID available for unregistration');
      return false;
    }

    const { error } = await supabase
      .from('user_devices')
      .delete()
      .eq('device_id', currentDeviceId);

    if (error) {
      console.error('❌ Error unregistering device:', error);
      return false;
    }

    console.log('✅ Device unregistered successfully');
    return true;
  } catch (error) {
    console.error('❌ Error in unregisterDevice:', error);
    return false;
  }
}

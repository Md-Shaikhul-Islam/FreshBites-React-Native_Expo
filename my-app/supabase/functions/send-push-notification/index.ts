import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', { 
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        } 
      });
    }

    const { userIds, title, body, data } = await req.json();
    
    console.log('📤 Sending push notification to users:', userIds);
    
    // Get push tokens from user_devices table
    const { data: devices, error } = await supabase
      .from('user_devices')
      .select('push_token')
      .in('user_id', userIds)
      .not('push_token', 'is', null);
    
    if (error) {
      console.error('❌ Error fetching devices:', error);
      throw error;
    }
    
    if (!devices || devices.length === 0) {
      console.log('⚠️ No devices found for users:', userIds);
      return new Response(
        JSON.stringify({ success: true, message: 'No devices to notify' }),
        { 
          headers: { 
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }
    
    // Build Expo push messages
    const messages = devices.map(device => ({
      to: device.push_token,
      sound: 'default',
      title: title,
      body: body,
      data: data,
      channelId: 'default',
    }));
    
    console.log('📱 Sending to', messages.length, 'devices');
    
    // Send push notifications via Expo
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });
    
    const result = await response.json();
    console.log('✅ Expo response:', result);
    
    return new Response(
      JSON.stringify({ success: true, result, devicesNotified: messages.length }),
      { 
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  }
});

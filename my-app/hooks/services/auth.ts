import { supabase } from '@/config/supabase';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'normal' | 'premium' | 'manager';
  created_at: string;
  updated_at: string;
}

/**
 * Authenticate user with username and password
 */
export async function loginUser(username: string, password: string): Promise<User | null> {
  try {
    console.log('🔐 Authenticating user:', username);
    console.log('📡 Supabase URL:', supabase.supabaseUrl);
    
    // Check if supabase is initialized
    if (!supabase) {
      console.error('❌ Supabase client not initialized!');
      throw new Error('Database connection not available');
    }

    console.log('📞 Calling authenticate_user RPC...');
    
    // Call Supabase function to authenticate
    const { data, error } = await supabase
      .rpc('authenticate_user', {
        p_username: username,
        p_password: password
      });

    console.log('📥 RPC Response - Data:', data);
    console.log('📥 RPC Response - Error:', error);

    if (error) {
      console.error('❌ Error authenticating user:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('❌ Invalid username or password');
      return null;
    }

    const user = data[0];
    console.log('✅ User authenticated:', user);
    return user;
  } catch (error: any) {
    console.error('❌ Error in loginUser:', error);
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error stack:', error?.stack);
    return null;
  }
}

/**
 * Register new user
 */
export async function registerUser(
  username: string,
  password: string,
  email: string,
  name: string,
  phone?: string
): Promise<User | null> {
  try {
    console.log('📝 Registering new user:', username);
    
    // Call Supabase function to register
    const { data, error } = await supabase
      .rpc('register_user', {
        p_username: username,
        p_password: password,
        p_email: email,
        p_name: name,
        p_phone: phone || null
      });

    if (error) {
      console.error('❌ Error registering user:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('❌ Registration failed');
      return null;
    }

    const user = data[0];
    console.log('✅ User registered:', user);
    return user;
  } catch (error) {
    console.error('❌ Error in registerUser:', error);
    return null;
  }
}

/**
 * Check if username exists
 */
export async function checkUsernameExists(username: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error checking username:', error);
      return false;
    }

    return data !== null;
  } catch (error) {
    console.error('❌ Error in checkUsernameExists:', error);
    return false;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error fetching user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('❌ Error in getUserById:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }

    console.log('✅ User updated:', user);
    return user;
  } catch (error) {
    console.error('❌ Error in updateUser:', error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error fetching user by email:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('❌ Error in getUserByEmail:', error);
    return null;
  }
}

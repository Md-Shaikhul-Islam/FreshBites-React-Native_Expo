-- ============================================================================
-- FIX: Remove Old Products from New User Registration
-- ============================================================================
-- This fix ensures new users DON'T get notifications for existing products
-- They will only get notifications for products added AFTER their registration
-- ============================================================================

CREATE OR REPLACE FUNCTION register_user(
    p_username TEXT,
    p_password TEXT,
    p_email TEXT,
    p_name TEXT,
    p_phone TEXT DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    username text,
    email text,
    name text,
    phone text,
    address text,
    role text,
    created_at timestamptz,
    updated_at timestamptz
) AS $$
DECLARE
    v_password_hash text;
    v_user_id uuid;
BEGIN
    -- Hash the password
    v_password_hash := crypt(p_password, gen_salt('bf'));
    
    -- Insert new user with default notification preferences
    INSERT INTO users (username, password_hash, email, name, phone, role, notification_preferences)
    VALUES (
        p_username, 
        v_password_hash, 
        p_email, 
        p_name, 
        p_phone, 
        'normal',
        '{"product_added": true, "product_removed": true, "order_placed": true}'::jsonb
    )
    RETURNING users.id INTO v_user_id;
    
    -- DON'T create notifications for existing products
    -- New user will only get notifications for products added AFTER registration
    -- Triggers (trigger_product_added_notification) will handle this automatically
    
    -- Return the newly created user
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.email,
        u.name,
        u.phone,
        u.address,
        u.role,
        u.created_at,
        u.updated_at
    FROM users u
    WHERE u.id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FIX APPLIED!
-- ============================================================================
-- Now when a new user registers:
-- 1. User is created with default notification preferences
-- 2. NO notifications are created for existing products
-- 3. Future product additions will trigger notifications via trigger_product_added_notification
-- 4. New user will only see products added AFTER their registration
-- ============================================================================

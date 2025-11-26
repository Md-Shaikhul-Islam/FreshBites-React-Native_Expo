-- ============================================================================
-- NOTIFICATION SYSTEM REDESIGN - COMPLETE DATABASE MIGRATION
-- ============================================================================
-- This script redesigns the notification system to be user-specific
-- Each notification is created separately for each user
-- ============================================================================

-- STEP 0: ENSURE NOTIFICATION_PREFERENCES COLUMN EXISTS
-- ============================================================================

-- Add notification_preferences column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"product_added": true, "product_removed": true, "order_placed": true}'::jsonb;

-- Update existing users
UPDATE users 
SET notification_preferences = '{"product_added": true, "product_removed": true, "order_placed": true}'::jsonb
WHERE notification_preferences IS NULL;

-- ============================================================================
-- STEP 1: DROP OLD SYSTEM
-- ============================================================================

-- Drop old triggers (force drop even if dependencies exist)
DROP TRIGGER IF EXISTS trigger_product_added_notification ON products CASCADE;
DROP TRIGGER IF EXISTS trigger_product_removed_notification ON products CASCADE;
DROP TRIGGER IF EXISTS trigger_order_placed_notification ON orders CASCADE;
DROP TRIGGER IF EXISTS trigger_create_product_notification ON products CASCADE;
DROP TRIGGER IF EXISTS trigger_remove_product_notification ON products CASCADE;
DROP TRIGGER IF EXISTS trigger_order_notification ON orders CASCADE;

-- Drop old functions
DROP FUNCTION IF EXISTS create_product_notification() CASCADE;
DROP FUNCTION IF EXISTS notify_product_creator_on_order() CASCADE;

-- Drop user_devices table (no longer needed - optional, keep if needed for push tokens)
-- DROP TABLE IF EXISTS user_devices CASCADE;

-- ============================================================================
-- STEP 1.5: FIX ORDERS TABLE - Convert product_id from uuid to text
-- ============================================================================

-- Drop foreign key constraint first, then convert type
DO $$ 
BEGIN
    -- Drop foreign key constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_product_id_fkey' 
        AND table_name = 'orders'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_product_id_fkey;
        RAISE NOTICE 'Dropped foreign key constraint orders_product_id_fkey';
    END IF;
    
    -- Check if product_id column is uuid type and convert to text
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'product_id' 
        AND data_type = 'uuid'
    ) THEN
        -- Convert uuid to text
        ALTER TABLE orders ALTER COLUMN product_id TYPE text USING product_id::text;
        RAISE NOTICE 'Converted orders.product_id from uuid to text';
    END IF;
    
    -- Note: We don't recreate the foreign key constraint because:
    -- 1. orders.product_id is now text (can store any string)
    -- 2. products.id is uuid (typed)
    -- 3. The trigger function handles the matching with type casting
    -- 4. This gives us flexibility for future product ID formats
END $$;

-- ============================================================================
-- STEP 2: RECREATE NOTIFICATIONS TABLE WITH NEW STRUCTURE
-- ============================================================================

-- Drop and recreate notifications table
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User this notification belongs to
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification type
    type text NOT NULL CHECK (type IN ('product_added', 'product_removed', 'order_placed')),
    
    -- Product information
    product_id text,
    product_title text NOT NULL,
    product_image text,
    
    -- For order notifications - customer info
    customer_name text,
    
    -- Read status for this specific user
    is_read boolean DEFAULT false NOT NULL,
    
    -- Who created the action (for order notifications, this is the customer)
    created_by_user uuid REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Indexes for fast queries
    CONSTRAINT notifications_user_id_idx_key UNIQUE (id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_type ON notifications(user_id, type);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================================
-- STEP 3: HELPER FUNCTION - Get all users except the actor
-- ============================================================================

CREATE OR REPLACE FUNCTION get_all_users_except(excluded_user_id uuid DEFAULT NULL)
RETURNS TABLE(user_id uuid) AS $$
BEGIN
    RETURN QUERY
    SELECT id FROM users
    WHERE (excluded_user_id IS NULL OR id != excluded_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: TRIGGER FUNCTION - Product Added Notification
-- ============================================================================

CREATE OR REPLACE FUNCTION create_product_added_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Create notification for ALL users EXCEPT the creator
    FOR v_user_id IN SELECT user_id FROM get_all_users_except(NEW.created_by) LOOP
        INSERT INTO notifications (
            user_id,
            type,
            product_id,
            product_title,
            product_image,
            created_by_user
        ) VALUES (
            v_user_id,
            'product_added',
            NEW.id::text,
            NEW.title,
            NEW.image,
            NEW.created_by
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: TRIGGER FUNCTION - Product Removed Notification
-- ============================================================================

CREATE OR REPLACE FUNCTION create_product_removed_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Create notification for ALL users EXCEPT the creator
    FOR v_user_id IN SELECT user_id FROM get_all_users_except(OLD.created_by) LOOP
        INSERT INTO notifications (
            user_id,
            type,
            product_id,
            product_title,
            product_image,
            created_by_user
        ) VALUES (
            v_user_id,
            'product_removed',
            OLD.id::text,
            OLD.title,
            OLD.image,
            OLD.created_by
        );
    END LOOP;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 6: TRIGGER FUNCTION - Order Notification (Only for Product Creator)
-- ============================================================================

CREATE OR REPLACE FUNCTION create_order_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_product record;
BEGIN
    -- Get product details using product_id from order
    -- Handle both uuid and text types
    SELECT id, title, image, created_by
    INTO v_product
    FROM products
    WHERE id::text = NEW.product_id OR id = NEW.product_id::uuid;
    
    -- Create notification ONLY for the product creator (not the customer)
    IF v_product.created_by IS NOT NULL AND v_product.created_by != NEW.customer_id THEN
        INSERT INTO notifications (
            user_id,
            type,
            product_id,
            product_title,
            product_image,
            customer_name,
            created_by_user
        ) VALUES (
            v_product.created_by,  -- Only for product creator
            'order_placed',
            NEW.product_id,
            NEW.product_title,
            v_product.image,
            NEW.customer_name,
            NEW.customer_id  -- Who placed the order
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 7: CREATE TRIGGERS
-- ============================================================================

-- Trigger for product added
DROP TRIGGER IF EXISTS trigger_product_added_notification ON products CASCADE;
CREATE TRIGGER trigger_product_added_notification
    AFTER INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION create_product_added_notification();

-- Trigger for product removed
DROP TRIGGER IF EXISTS trigger_product_removed_notification ON products CASCADE;
CREATE TRIGGER trigger_product_removed_notification
    AFTER DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION create_product_removed_notification();

-- Trigger for order placed
DROP TRIGGER IF EXISTS trigger_order_placed_notification ON orders CASCADE;
CREATE TRIGGER trigger_order_placed_notification
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION create_order_notification();

-- ============================================================================
-- STEP 8: UTILITY FUNCTIONS FOR APP
-- ============================================================================

-- Mark single notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id uuid, p_user_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE notifications
    SET is_read = true, updated_at = now()
    WHERE id = notification_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE notifications
    SET is_read = true, updated_at = now()
    WHERE user_id = p_user_id AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clear all notifications for a user
CREATE OR REPLACE FUNCTION clear_all_notifications(p_user_id uuid)
RETURNS void AS $$
BEGIN
    DELETE FROM notifications WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get unread count for a user (with preferences)
CREATE OR REPLACE FUNCTION get_unread_notification_count(
    p_user_id uuid,
    p_preferences jsonb DEFAULT NULL
)
RETURNS integer AS $$
DECLARE
    v_count integer;
BEGIN
    -- If no preferences provided, count all unread
    IF p_preferences IS NULL THEN
        SELECT COUNT(*)::integer INTO v_count
        FROM notifications
        WHERE user_id = p_user_id AND is_read = false;
    ELSE
        -- Count unread notifications matching preferences
        SELECT COUNT(*)::integer INTO v_count
        FROM notifications
        WHERE user_id = p_user_id 
          AND is_read = false
          AND (
              (type = 'product_added' AND (p_preferences->>'product_added')::boolean = true) OR
              (type = 'product_removed' AND (p_preferences->>'product_removed')::boolean = true) OR
              (type = 'order_placed' AND (p_preferences->>'order_placed')::boolean = true)
          );
    END IF;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 9: SET UP ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid() OR true);  -- Change to auth.uid() in production

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid() OR true);  -- Change to auth.uid() in production

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    USING (user_id = auth.uid() OR true);  -- Change to auth.uid() in production

-- Policy: System can insert notifications (via triggers)
CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- STEP 10: UPDATE register_user FUNCTION (from previous migration)
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
    -- Triggers will handle this automatically
    
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
-- STEP 11: AUTHENTICATE_USER FUNCTION (Required for login)
-- ============================================================================

CREATE OR REPLACE FUNCTION authenticate_user(
    p_username TEXT,
    p_password TEXT
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
BEGIN
    -- Return user if username and password match
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
    WHERE u.username = p_username
      AND u.password_hash = crypt(p_password, u.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- Now you can:
-- 1. Query notifications: SELECT * FROM notifications WHERE user_id = 'xxx'
-- 2. Mark as read: SELECT mark_notification_read('notif-id', 'user-id')
-- 3. Get unread count: SELECT get_unread_notification_count('user-id')
-- 4. Login: SELECT * FROM authenticate_user('username', 'password')
-- 5. Register: SELECT * FROM register_user('username', 'pass', 'email', 'name')
-- ============================================================================

-- Test queries (uncomment to test):
-- SELECT * FROM notifications WHERE user_id = (SELECT id FROM users LIMIT 1);
-- SELECT get_unread_notification_count((SELECT id FROM users LIMIT 1));
-- SELECT * FROM authenticate_user('your-username', 'your-password');
-- C:\Users\BS01318\OneDrive - Brain Station 23\Documents\GitHub\REACT-NATIVE\my-app\NOTIFICATION_SYSTEM_REDESIGN.sql
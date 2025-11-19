# Supabase Notifications Setup

## Step 1: Create notifications table

Run this SQL in Supabase SQL Editor:

```sql
-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('product_added', 'product_removed')),
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  product_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_by TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Create index for faster queries
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read notifications
CREATE POLICY "Anyone can read notifications"
  ON notifications
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert notifications (for manager actions)
CREATE POLICY "Anyone can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can update their read status
CREATE POLICY "Anyone can update notifications"
  ON notifications
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

## Step 2: Add creator_device_id column to products table

```sql
-- Add creator_device_id column to track who made changes
ALTER TABLE products ADD COLUMN IF NOT EXISTS creator_device_id TEXT;
```

## Step 3: Create trigger to auto-create notifications (excluding creator)

```sql
-- Function to create notification when product is added/deleted
-- Excludes the creator device from receiving the notification
CREATE OR REPLACE FUNCTION create_product_notification()
RETURNS TRIGGER AS $$
DECLARE
  creator_id TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Product added
    creator_id := NEW.creator_device_id;
    INSERT INTO notifications (type, product_id, product_title, product_image, read_by)
    VALUES (
      'product_added', 
      NEW.id::text, 
      NEW.title, 
      NEW.image,
      CASE WHEN creator_id IS NOT NULL THEN ARRAY[creator_id] ELSE ARRAY[]::TEXT[] END
    );
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Product removed
    creator_id := OLD.creator_device_id;
    INSERT INTO notifications (type, product_id, product_title, product_image, read_by)
    VALUES (
      'product_removed', 
      OLD.id::text, 
      OLD.title, 
      OLD.image,
      CASE WHEN creator_id IS NOT NULL THEN ARRAY[creator_id] ELSE ARRAY[]::TEXT[] END
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on products table
DROP TRIGGER IF EXISTS auto_create_notification ON products;
CREATE TRIGGER auto_create_notification
  AFTER INSERT OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION create_product_notification();
```

## Done!

After running these SQLs:
- Notifications will auto-create when products are added/removed
- All devices will receive real-time updates via Supabase Realtime
- No Edge Functions needed!

# 🔧 Supabase Database Update Required

## Important: Run these SQL commands in Supabase SQL Editor

After the recent code changes, you need to update your Supabase database to:
1. Add support for tracking who created/deleted products
2. Exclude the creator from receiving their own notifications
3. Prevent duplicate product deletions

---

## Step 1: Add creator_device_id column

```sql
-- Add column to track which device created/modified products
ALTER TABLE products ADD COLUMN IF NOT EXISTS creator_device_id TEXT;
```

---

## Step 2: Update the notification trigger

```sql
-- Function to create notification when product is added/deleted
-- This version excludes the creator device from receiving the notification
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
      -- Mark as read for creator so they don't see their own notification
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
      -- Mark as read for creator so they don't see their own notification
      CASE WHEN creator_id IS NOT NULL THEN ARRAY[creator_id] ELSE ARRAY[]::TEXT[] END
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger (drops and recreates automatically)
DROP TRIGGER IF EXISTS auto_create_notification ON products;
CREATE TRIGGER auto_create_notification
  AFTER INSERT OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION create_product_notification();
```

---

## What This Does:

✅ **Prevents self-notifications**: Managers who add/delete products won't receive notifications about their own actions

✅ **Real-time updates**: All tabs (Shop, Premium, Manager) now automatically reload when products change

✅ **Prevents duplicate deletes**: Since tabs auto-reload, multiple managers can't delete the same product

---

## After Running These SQLs:

1. Test by adding a product in Manager tab
2. You (the manager) should NOT see a notification
3. Other devices should receive the notification
4. Shop/Premium tabs should automatically show the new product
5. Try deleting a product - same behavior applies

---

## Verification:

Run this to check if the column was added:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'creator_device_id';
```

You should see:
```
column_name          | data_type
---------------------|----------
creator_device_id    | text
```

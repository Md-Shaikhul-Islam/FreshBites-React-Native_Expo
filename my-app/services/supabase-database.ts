import { supabase } from '../config/supabase';

export type Product = {
  id: string;
  sku: string;
  title: string;
  description?: string;
  price: number; // Database column is numeric
  price_value: number; // Database column name only
  image: string;
  is_premium?: boolean;
  created_at?: string;
  updated_at?: string;
};

/**
 * Supabase Database Service
 * Handles CRUD operations for products using Supabase database
 */

/**
 * Fetch all products from database
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    console.log('📥 Fetching products from Supabase database...');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_premium', false)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }
    
    console.log(`✅ Fetched ${data?.length || 0} products from database`);
    return data || [];
  } catch (error) {
    console.error('❌ Database fetch error:', error);
    throw error;
  }
}

/**
 * Fetch all premium items from database
 */
export async function fetchPremiumItems(): Promise<Product[]> {
  try {
    console.log('📥 Fetching premium items from Supabase database...');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_premium', true)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching premium items:', error);
      throw error;
    }
    
    console.log(`✅ Fetched ${data?.length || 0} premium items from database`);
    return data || [];
  } catch (error) {
    console.error('❌ Database fetch error:', error);
    throw error;
  }
}

/**
 * Add a new product to database
 */
export async function addProduct(
  product: Omit<Product, 'created_at' | 'updated_at'>, 
  creatorDeviceId?: string
): Promise<Product> {
  try {
    console.log(`📤 Adding product to database: ${product.title}`);
    
    // Store creator device ID in product metadata if provided
    const productWithMetadata = creatorDeviceId 
      ? { ...product, creator_device_id: creatorDeviceId }
      : product;
    
    const { data, error } = await supabase
      .from('products')
      .insert([productWithMetadata])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error adding product:', error);
      throw error;
    }
    
    console.log(`✅ Product added successfully: ${product.title}`);
    return data;
  } catch (error) {
    console.error('❌ Database insert error:', error);
    throw error;
  }
}

/**
 * Update an existing product in database
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  try {
    console.log(`📝 Updating product in database: ${id}`);
    
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating product:', error);
      throw error;
    }
    
    console.log(`✅ Product updated successfully: ${id}`);
    return data;
  } catch (error) {
    console.error('❌ Database update error:', error);
    throw error;
  }
}

/**
 * Delete a product from database
 */
export async function deleteProduct(id: string, creatorDeviceId?: string): Promise<void> {
  try {
    console.log(`🗑️ Deleting product from database: ${id}`);
    
    // First, update the product with creator device ID before deleting
    // This allows the trigger to know who deleted it
    if (creatorDeviceId) {
      await supabase
        .from('products')
        .update({ creator_device_id: creatorDeviceId })
        .eq('id', id);
    }
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Error deleting product:', error);
      throw error;
    }
    
    console.log(`✅ Product deleted successfully: ${id}`);
  } catch (error) {
    console.error('❌ Database delete error:', error);
    throw error;
  }
}

/**
 * Watch for real-time changes in products table
 */
export function watchProductChanges(callback: (products: Product[]) => void): () => void {
  console.log('👀 Setting up real-time subscription for products...');
  
  const subscription = supabase
    .channel('products_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, 
      async (payload) => {
        console.log('🔄 Database change detected:', payload.eventType);
        
        // Fetch fresh data and notify callback
        try {
          const allProducts = await fetchProducts();
          const premiumItems = await fetchPremiumItems();
          callback([...allProducts, ...premiumItems]);
        } catch (error) {
          console.error('❌ Error fetching updated data:', error);
        }
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    console.log('🛑 Unsubscribing from product changes');
    supabase.removeChannel(subscription);
  };
}

/**
 * Bulk upload products (for migration from JSON files)
 */
export async function uploadProductsBulk(products: Product[]): Promise<void> {
  try {
    console.log(`📦 Bulk uploading ${products.length} products to database...`);
    
    const { data, error } = await supabase
      .from('products')
      .upsert(products, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('❌ Error bulk uploading products:', error);
      throw error;
    }
    
    console.log(`✅ Bulk upload completed: ${products.length} products`);
  } catch (error) {
    console.error('❌ Database bulk upload error:', error);
    throw error;
  }
}